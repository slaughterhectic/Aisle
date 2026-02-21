import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../../database/entities/conversation.entity';
import { Message, MessageRole } from '../../database/entities/message.entity';
import { CreateConversationDto, ConversationResponse, MessageResponse } from './dto/conversation.dto';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
import { AssistantsService } from '../assistants/assistants.service';
import { SessionService, SessionState } from './session.service';

/**
 * Conversations Service
 * Manages conversation CRUD and message history.
 */
@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly assistantsService: AssistantsService,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Create a new conversation
   */
  async create(tenant: TenantContext, dto: CreateConversationDto): Promise<ConversationResponse> {
    // Verify assistant exists and belongs to tenant
    const assistant = await this.assistantsService.findOneEntity(tenant.tenantId, dto.assistantId);

    // Create conversation
    const conversation = this.conversationRepository.create({
      tenantId: tenant.tenantId,
      assistantId: dto.assistantId,
      userId: tenant.userId,
      title: dto.title,
    });

    const saved = await this.conversationRepository.save(conversation);

    // Initialize Redis session
    const sessionState: SessionState = {
      conversationId: saved.id,
      tenantId: tenant.tenantId,
      assistantId: dto.assistantId,
      userId: tenant.userId,
      recentMessages: [],
      lastActivity: Date.now(),
    };
    await this.sessionService.createSession(sessionState);

    return this.toConversationResponse(saved, assistant.name);
  }

  /**
   * Get all conversations for a user
   */
  async findAll(tenant: TenantContext): Promise<ConversationResponse[]> {
    const conversations = await this.conversationRepository.find({
      where: { tenantId: tenant.tenantId, userId: tenant.userId },
      relations: ['assistant'],
      order: { createdAt: 'DESC' },
    });

    return conversations.map((c) => this.toConversationResponse(c, c.assistant?.name || 'Unknown'));
  }

  /**
   * Get a specific conversation
   */
  async findOne(tenant: TenantContext, id: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id, tenantId: tenant.tenantId },
      relations: ['assistant'],
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID "${id}" not found`);
    }

    return conversation;
  }

  /**
   * Update a conversation (e.g., rename title)
   */
  async update(tenant: TenantContext, id: string, title?: string): Promise<ConversationResponse> {
    const conversation = await this.findOne(tenant, id);
    if (title !== undefined) {
      conversation.title = title;
      await this.conversationRepository.save(conversation);
    }
    return this.toConversationResponse(conversation, conversation.assistant?.name || 'Unknown');
  }

  /**
   * Delete a conversation
   */
  async delete(tenant: TenantContext, id: string): Promise<void> {
    const conversation = await this.findOne(tenant, id);
    
    // Clear redis session if exists
    await this.sessionService.deleteSession(id).catch((err: any) => {
      this.logger.warn(`Failed to clear session for deleted conversation ${id}`);
    });

    await this.conversationRepository.remove(conversation);
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(tenant: TenantContext, conversationId: string): Promise<MessageResponse[]> {
    // Verify conversation access
    await this.findOne(tenant, conversationId);

    const messages = await this.messageRepository.find({
      where: { tenantId: tenant.tenantId, conversationId },
      order: { createdAt: 'ASC' },
    });

    return messages.map((m) => this.toMessageResponse(m));
  }

  /**
   * Save a message to the database
   */
  async saveMessage(
    tenantId: string,
    conversationId: string,
    role: MessageRole,
    content: string,
    tokensUsed: number = 0,
    model?: string,
    contextChunks?: any[],
  ): Promise<Message> {
    const message = this.messageRepository.create({
      tenantId,
      conversationId,
      role,
      content,
      tokensUsed,
      model,
      contextChunks,
    });

    return this.messageRepository.save(message);
  }

  /**
   * Update conversation token count
   */
  async updateTokenCount(conversationId: string, tokensUsed: number): Promise<void> {
    await this.conversationRepository.increment(
      { id: conversationId },
      'totalTokensUsed',
      tokensUsed,
    );
  }

  /**
   * Get recent messages for context building
   */
  async getRecentMessages(conversationId: string, limit: number = 10): Promise<Message[]> {
    return this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  private toConversationResponse(conversation: Conversation, assistantName: string): ConversationResponse {
    return {
      id: conversation.id,
      assistantId: conversation.assistantId,
      assistantName,
      userId: conversation.userId,
      title: conversation.title,
      totalTokensUsed: conversation.totalTokensUsed,
      createdAt: conversation.createdAt,
    };
  }

  private toMessageResponse(message: Message): MessageResponse {
    return {
      id: message.id,
      role: message.role as 'user' | 'assistant' | 'system',
      content: message.content,
      tokensUsed: message.tokensUsed,
      model: message.model,
      createdAt: message.createdAt,
    };
  }
}
