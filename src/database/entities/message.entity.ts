import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { Conversation } from './conversation.entity';

/**
 * Message Role
 */
export enum MessageRole {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant',
}

/**
 * Message Entity
 * Represents a single message in a conversation.
 */
@Entity('messages')
@Index(['tenantId', 'conversationId'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** CRITICAL: All queries must filter by tenantId for data isolation */
  @Column('uuid')
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column('uuid')
  conversationId: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @Column({
    type: 'enum',
    enum: MessageRole,
  })
  role: MessageRole;

  @Column({ type: 'text' })
  content: string;

  /** Tokens used for this message (input for user, output for assistant) */
  @Column({ default: 0 })
  tokensUsed: number;

  /** Context chunks used for RAG (stored as JSON for reference) */
  @Column({ type: 'jsonb', nullable: true })
  contextChunks: ContextChunk[];

  /** Model used for generating this response (for assistant messages) */
  @Column({ length: 100, nullable: true })
  model: string;

  @CreateDateColumn()
  createdAt: Date;
}

/**
 * RAG context chunk reference
 */
export interface ContextChunk {
  documentId: string;
  chunkId: string;
  content: string;
  score: number;
}
