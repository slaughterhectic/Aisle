import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ChatService } from './chat.service';
import {
  CreateConversationDto,
  ChatMessageDto,
  ConversationResponse,
  MessageResponse,
  ChatResponse,
  UpdateConversationDto,
} from './dto/conversation.dto';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';

/**
 * Conversations Controller
 * REST API endpoints for conversation and chat management.
 */
@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly chatService: ChatService,
  ) {}

  /**
   * Create a new conversation
   * POST /conversations
   */
  @Post()
  async create(
    @Tenant() tenant: TenantContext,
    @Body() dto: CreateConversationDto,
  ): Promise<ConversationResponse> {
    return this.conversationsService.create(tenant, dto);
  }

  /**
   * List all conversations for the current user
   * GET /conversations
   */
  @Get()
  async findAll(@Tenant() tenant: TenantContext): Promise<ConversationResponse[]> {
    return this.conversationsService.findAll(tenant);
  }

  /**
   * Update a conversation
   * PUT /conversations/:id
   */
  @Post(':id/update') // Using Post or Put, Put fits rest but I'll use Put
  async update(
    @Tenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConversationDto,
  ): Promise<ConversationResponse> {
    return this.conversationsService.update(tenant, id, dto.title);
  }

  /**
   * Delete a conversation
   * DELETE /conversations/:id
   */
  @Post(':id/delete')
  async delete(
    @Tenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean }> {
    await this.conversationsService.delete(tenant, id);
    return { success: true };
  }

  /**
   * Get messages for a conversation
   * GET /conversations/:id/messages
   */
  @Get(':id/messages')
  async getMessages(
    @Tenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MessageResponse[]> {
    return this.conversationsService.getMessages(tenant, id);
  }

  /**
   * Send a chat message
   * POST /conversations/:id/chat
   * 
   * This is the main chat endpoint that triggers the complete RAG flow:
   * 1. Load conversation state
   * 2. Perform vector search (if RAG enabled)
   * 3. Build prompt with context
   * 4. Call LLM
   * 5. Persist messages
   * 6. Log usage
   * 7. Return response
   */
  @Post(':id/chat')
  async chat(
    @Tenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChatMessageDto,
  ): Promise<ChatResponse> {
    return this.chatService.chat(tenant, id, dto);
  }
}
