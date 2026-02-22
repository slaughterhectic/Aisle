"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const conversations_service_1 = require("./conversations.service");
const session_service_1 = require("./session.service");
const assistants_service_1 = require("../assistants/assistants.service");
const vector_search_service_1 = require("../vector-search/vector-search.service");
const llm_gateway_service_1 = require("../llm-gateway/llm-gateway.service");
const usage_service_1 = require("../usage/usage.service");
const message_entity_1 = require("../../database/entities/message.entity");
let ChatService = ChatService_1 = class ChatService {
    conversationsService;
    sessionService;
    assistantsService;
    vectorSearchService;
    llmGatewayService;
    usageService;
    logger = new common_1.Logger(ChatService_1.name);
    constructor(conversationsService, sessionService, assistantsService, vectorSearchService, llmGatewayService, usageService) {
        this.conversationsService = conversationsService;
        this.sessionService = sessionService;
        this.assistantsService = assistantsService;
        this.vectorSearchService = vectorSearchService;
        this.llmGatewayService = llmGatewayService;
        this.usageService = usageService;
    }
    async chat(tenant, conversationId, dto) {
        const startTime = Date.now();
        const conversation = await this.conversationsService.findOne(tenant, conversationId);
        const assistant = await this.assistantsService.findOneEntity(tenant.tenantId, conversation.assistantId);
        let session = await this.sessionService.getSession(conversationId);
        if (!session) {
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
        let contextChunks = [];
        let ragContext = '';
        if (assistant.ragEnabled) {
            try {
                const searchResults = await this.vectorSearchService.search(tenant.tenantId, assistant.id, dto.message, assistant.ragTopK);
                contextChunks = searchResults.map((r) => ({
                    documentId: r.documentId,
                    chunkId: r.chunkId,
                    content: r.content,
                    score: r.score,
                }));
                if (contextChunks.length > 0) {
                    ragContext = this.buildRagContext(contextChunks);
                }
            }
            catch (error) {
                this.logger.warn(`RAG search failed for conversation ${conversationId}`, error);
            }
        }
        const messages = this.buildPromptMessages(assistant.systemPrompt, session.recentMessages, dto.message, ragContext, session.summary);
        const llmResponse = await this.llmGatewayService.chat(messages, {
            provider: assistant.provider,
            model: assistant.model,
            temperature: Number(assistant.temperature),
            maxTokens: assistant.maxTokens,
        });
        await this.conversationsService.saveMessage(tenant.tenantId, conversationId, message_entity_1.MessageRole.USER, dto.message, llmResponse.usage.promptTokens);
        const assistantMessage = await this.conversationsService.saveMessage(tenant.tenantId, conversationId, message_entity_1.MessageRole.ASSISTANT, llmResponse.content, llmResponse.usage.completionTokens, llmResponse.model, contextChunks.length > 0 ? contextChunks : undefined);
        await this.sessionService.addMessage(conversationId, {
            role: message_entity_1.MessageRole.USER,
            content: dto.message,
            timestamp: Date.now(),
        });
        await this.sessionService.addMessage(conversationId, {
            role: message_entity_1.MessageRole.ASSISTANT,
            content: llmResponse.content,
            timestamp: Date.now(),
        });
        const totalTokens = llmResponse.usage.promptTokens + llmResponse.usage.completionTokens;
        await this.conversationsService.updateTokenCount(conversationId, totalTokens);
        if (!conversation.title || conversation.title === 'New Conversation') {
            try {
                const titlePrompt = [
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
            }
            catch (err) {
                this.logger.error(`Failed to generate auto-title for conversation ${conversationId}`, err);
            }
        }
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
        const messageResponse = {
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
    buildRagContext(chunks) {
        const contextParts = chunks.map((chunk, index) => `[Context ${index + 1}]:\n${chunk.content}`);
        return contextParts.join('\n\n');
    }
    buildPromptMessages(systemPrompt, recentMessages, userMessage, ragContext, summary) {
        const messages = [];
        let systemContent = systemPrompt;
        if (ragContext) {
            systemContent += `\n\n---\nUse the following context to answer the user's question:\n\n${ragContext}`;
        }
        messages.push({ role: 'system', content: systemContent });
        if (summary) {
            messages.push({ role: 'system', content: `Previous conversation summary: ${summary}` });
        }
        for (const msg of recentMessages) {
            messages.push({
                role: msg.role === message_entity_1.MessageRole.USER ? 'user' : 'assistant',
                content: msg.content,
            });
        }
        messages.push({ role: 'user', content: userMessage });
        return messages;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [conversations_service_1.ConversationsService,
        session_service_1.SessionService,
        assistants_service_1.AssistantsService,
        vector_search_service_1.VectorSearchService,
        llm_gateway_service_1.LlmGatewayService,
        usage_service_1.UsageService])
], ChatService);
//# sourceMappingURL=chat.service.js.map