import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';

/**
 * LLM Model Configuration
 */
export enum LLMProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
}

/**
 * Assistant Entity
 * Represents an AI assistant configured by a tenant.
 * Each assistant can have its own system prompt, model settings, and RAG configuration.
 */
@Entity('assistants')
export class Assistant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** CRITICAL: All queries must filter by tenantId for data isolation */
  @Column('uuid')
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  /** System prompt that defines the assistant's behavior */
  @Column({ type: 'text' })
  systemPrompt: string;

  /** LLM provider to use */
  @Column({
    type: 'enum',
    enum: LLMProvider,
    default: LLMProvider.OPENAI,
  })
  provider: LLMProvider;

  /** Model identifier (e.g., 'gpt-4o-mini', 'claude-3-sonnet') */
  @Column({ length: 100, default: 'gpt-4o-mini' })
  model: string;

  /** Temperature for response generation (0.0 - 2.0) */
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.7 })
  temperature: number;

  /** Maximum tokens for response */
  @Column({ default: 2048 })
  maxTokens: number;

  /** Whether RAG (document retrieval) is enabled for this assistant */
  @Column({ default: true })
  ragEnabled: boolean;

  /** Number of context chunks to retrieve when RAG is enabled */
  @Column({ default: 5 })
  ragTopK: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
