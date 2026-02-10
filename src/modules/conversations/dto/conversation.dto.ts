import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

/**
 * DTO for creating a new conversation
 */
export class CreateConversationDto {
  @IsUUID()
  assistantId: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;
}

/**
 * DTO for sending a chat message
 */
export class ChatMessageDto {
  @IsString()
  @MaxLength(32000)
  message: string;
}

/**
 * Conversation response DTO
 */
export interface ConversationResponse {
  id: string;
  assistantId: string;
  assistantName: string;
  userId: string;
  title: string | null;
  totalTokensUsed: number;
  createdAt: Date;
}

/**
 * Message response DTO
 */
export interface MessageResponse {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokensUsed: number;
  model: string | null;
  createdAt: Date;
}

/**
 * Chat response DTO
 */
export interface ChatResponse {
  message: MessageResponse;
  conversationId: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  contextChunks?: {
    documentId: string;
    content: string;
    score: number;
  }[];
}
