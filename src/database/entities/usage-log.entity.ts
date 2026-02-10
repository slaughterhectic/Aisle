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
import { Assistant } from './assistant.entity';
import { User } from './user.entity';

/**
 * Usage Log Entity
 * Tracks token usage per request for billing and analytics.
 */
@Entity('usage_logs')
@Index(['tenantId', 'createdAt'])
@Index(['tenantId', 'assistantId'])
export class UsageLog {
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
  assistantId: string;

  @ManyToOne(() => Assistant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assistantId' })
  assistant: Assistant;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  /** Conversation ID for reference */
  @Column('uuid', { nullable: true })
  conversationId: string;

  /** Tokens in the input prompt */
  @Column()
  tokensInput: number;

  /** Tokens in the output response */
  @Column()
  tokensOutput: number;

  /** Total tokens (input + output) */
  @Column()
  tokensTotal: number;

  /** LLM model used */
  @Column({ length: 100 })
  model: string;

  /** LLM provider used */
  @Column({ length: 50 })
  provider: string;

  /** Request latency in milliseconds */
  @Column({ nullable: true })
  latencyMs: number;

  /** Whether the request was successful */
  @Column({ default: true })
  success: boolean;

  /** Error message if the request failed */
  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}
