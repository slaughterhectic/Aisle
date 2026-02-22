import { Injectable, Logger } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { SessionService } from './session.service';
import { AssistantsService } from '../assistants/assistants.service';
import { VectorSearchService } from '../vector-search/vector-search.service';
import { LlmGatewayService, LLMMessage } from '../llm-gateway/llm-gateway.service';
import { UsageService } from '../usage/usage.service';
import { ChatMessageDto, ChatResponse, MessageResponse } from './dto/conversation.dto';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
import { MessageRole, ContextChunk } from '../../database/entities/message.entity';

/**
 * Chat Service
 * Orchestrates the complete chat flow including RAG, LLM calls, and persistence.
 * 
 * Chat Flow:
 * 1. Resolve tenant context (handled by guard)
 * 2. Load conversation and session state
 * 3. Perform vector search if RAG enabled
 * 4. Build prompt with context
 * 5. Call LLM
 * 6. Persist messages
 * 7. Update session
 * 8. Log usage
 * 9. Return response
 */
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly sessionService: SessionService,
    private readonly assistantsService: AssistantsService,
    private readonly vectorSearchService: VectorSearchService,
    private readonly llmGatewayService: LlmGatewayService,
    private readonly usageService: UsageService,
  ) { }

  /**
   * Process a chat message through the complete flow
   */
  async chat(tenant: TenantContext, conversationId: string, dto: ChatMessageDto): Promise<ChatResponse> {
    const startTime = Date.now();

    // Step 1-2: Load conversation and assistant
    const conversation = await this.conversationsService.findOne(tenant, conversationId);
    const assistant = await this.assistantsService.findOneEntity(tenant.tenantId, conversation.assistantId);

    // Step 3: Get session state (or create if expired)
    let session = await this.sessionService.getSession(conversationId);
    if (!session) {
      // Session expired, recreate from recent messages
      const recentMessages = await this.conversationsService.getRecentMessages(conversationId);
      session = {
        conversationId,
        tenantId: tenant.tenantId,
        assistantId: assistant.id,
        userId: tenant.userId,
        recentMessages: recentMessages.reverse().map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.createdAt.getTime(),
        })),
        lastActivity: Date.now(),
      };
      await this.sessionService.createSession(session);
    }

    // Step 4: RAG - Vector search for relevant context
    let contextChunks: ContextChunk[] = [];
    let ragContext = '';

    if (assistant.ragEnabled) {
      try {
        const searchResults = await this.vectorSearchService.search(
          tenant.tenantId,
          assistant.id,
          dto.message,
          assistant.ragTopK,
        );

        contextChunks = searchResults.map((r) => ({
          documentId: r.documentId,
          chunkId: r.chunkId,
          content: r.content,
          score: r.score,
        }));

        if (contextChunks.length > 0) {
          ragContext = this.buildRagContext(contextChunks);
        }
      } catch (error) {
        this.logger.warn(`RAG search failed for conversation ${conversationId}`, error);
        // Continue without RAG context
      }
    }

    // Step 5: Build prompt messages
    const messages = this.buildPromptMessages(
      assistant.systemPrompt,
      session.recentMessages,
      dto.message,
      ragContext,
      session.summary,
    );

    // Step 6: Call LLM
    const llmResponse = await this.llmGatewayService.chat(messages, {
      provider: assistant.provider,
      model: assistant.model,
      temperature: Number(assistant.temperature),
      maxTokens: assistant.maxTokens,
    });

    // Step 7: Save user message
    await this.conversationsService.saveMessage(
      tenant.tenantId,
      conversationId,
      MessageRole.USER,
      dto.message,
      llmResponse.usage.promptTokens,
    );

    // Save assistant response
    const assistantMessage = await this.conversationsService.saveMessage(
      tenant.tenantId,
      conversationId,
      MessageRole.ASSISTANT,
      llmResponse.content,
      llmResponse.usage.completionTokens,
      llmResponse.model,
      contextChunks.length > 0 ? contextChunks : undefined,
    );

    // Step 8: Update session
    await this.sessionService.addMessage(conversationId, {
      role: MessageRole.USER,
      content: dto.message,
      timestamp: Date.now(),
    });
    await this.sessionService.addMessage(conversationId, {
      role: MessageRole.ASSISTANT,
      content: llmResponse.content,
      timestamp: Date.now(),
    });

    // Update conversation token count
    const totalTokens = llmResponse.usage.promptTokens + llmResponse.usage.completionTokens;
    await this.conversationsService.updateTokenCount(conversationId, totalTokens);

    // Auto-generate title for new conversations
    if (!conversation.title || conversation.title === 'New Conversation') {
      try {
        const titlePrompt: LLMMessage[] = [
          { role: 'system', content: 'Generate a very brief, concise title (max 4 words) for a new chat about this topic. Return ONLY the title text, no quotes, no markdown, no extra words.' },
          { role: 'user', content: dto.message }
        ];

        const titleResponse = await this.llmGatewayService.chat(titlePrompt, {
          provider: assistant.provider,
          model: assistant.model,
          temperature: 0.3,
          maxTokens: 15,
        });

        const generatedTitle = titleResponse.content.replace(/["']/g, '').trim();
        if (generatedTitle) {
          await this.conversationsService.update(tenant, conversationId, generatedTitle);
        }
      } catch (err) {
        this.logger.error(`Failed to generate auto-title for conversation ${conversationId}`, err);
      }
    }

    // Step 9: Log usage
    const latencyMs = Date.now() - startTime;
    await this.usageService.logUsage({
      tenantId: tenant.tenantId,
      assistantId: assistant.id,
      userId: tenant.userId,
      conversationId,
      tokensInput: llmResponse.usage.promptTokens,
      tokensOutput: llmResponse.usage.completionTokens,
      model: llmResponse.model,
      provider: assistant.provider,
      latencyMs,
      success: true,
    });

    // Build response
    const messageResponse: MessageResponse = {
      id: assistantMessage.id,
      role: 'assistant',
      content: llmResponse.content,
      tokensUsed: llmResponse.usage.completionTokens,
      model: llmResponse.model,
      createdAt: assistantMessage.createdAt,
    };

    return {
      message: messageResponse,
      conversationId,
      tokensUsed: {
        input: llmResponse.usage.promptTokens,
        output: llmResponse.usage.completionTokens,
        total: totalTokens,
      },
      contextChunks: contextChunks.length > 0 ? contextChunks.map((c) => ({
        documentId: c.documentId,
        content: c.content,
        score: c.score,
      })) : undefined,
    };
  }

  /**
   * Build RAG context string from chunks
   */
  private buildRagContext(chunks: ContextChunk[]): string {
    const contextParts = chunks.map((chunk, index) =>
      `[Context ${index + 1}]:\n${chunk.content}`
    );
    return contextParts.join('\n\n');
  }

  /**
   * Build prompt messages array for LLM
   */
  private buildPromptMessages(
    systemPrompt: string,
    recentMessages: { role: MessageRole; content: string }[],
    userMessage: string,
    ragContext: string,
    summary?: string,
  ): LLMMessage[] {
    const messages: LLMMessage[] = [];

    // System message with optional RAG context
    let systemContent = systemPrompt;
    if (ragContext) {
      systemContent += `\n\n---\nUse the following context to answer the user's question:\n\n${ragContext}`;
    }
    messages.push({ role: 'system', content: systemContent });

    // Add conversation summary if available
    if (summary) {
      messages.push({ role: 'system', content: `Previous conversation summary: ${summary}` });
    }

    // Add recent messages for context
    for (const msg of recentMessages) {
      messages.push({
        role: msg.role === MessageRole.USER ? 'user' : 'assistant',
        content: msg.content,
      });
    }

    // Add current user message
    messages.push({ role: 'user', content: userMessage });

    return messages;
  }
}
