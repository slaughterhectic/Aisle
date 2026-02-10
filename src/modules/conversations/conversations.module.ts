import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { ChatService } from './chat.service';
import { SessionService } from './session.service';
import { Conversation } from '../../database/entities/conversation.entity';
import { Message } from '../../database/entities/message.entity';
import { AssistantsModule } from '../assistants/assistants.module';
import { VectorSearchModule } from '../vector-search/vector-search.module';
import { LlmGatewayModule } from '../llm-gateway/llm-gateway.module';
import { UsageModule } from '../usage/usage.module';

/**
 * Conversations Module
 * Handles chat conversations, message history, and session state.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]),
    AssistantsModule,
    VectorSearchModule,
    LlmGatewayModule,
    UsageModule,
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService, ChatService, SessionService],
  exports: [ConversationsService, ChatService, SessionService],
})
export class ConversationsModule {}
