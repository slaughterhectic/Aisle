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
import { Assistant } from './assistant.entity';

/**
 * Document processing status
 */
export enum DocumentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Document Entity
 * Represents an uploaded document in the knowledge base.
 */
@Entity('documents')
@Index(['tenantId', 'assistantId'])
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** CRITICAL: All queries must filter by tenantId for data isolation */
  @Column('uuid')
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  /** Assistant this document belongs to (for scoped RAG) */
  @Column('uuid')
  assistantId: string;

  @ManyToOne(() => Assistant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assistantId' })
  assistant: Assistant;

  /** Original filename */
  @Column({ length: 255 })
  filename: string;

  /** S3/MinIO object key */
  @Column({ length: 500 })
  s3Key: string;

  /** MIME type */
  @Column({ length: 100 })
  mimeType: string;

  /** File size in bytes */
  @Column({ type: 'bigint' })
  fileSize: number;

  /** Document version for updates */
  @Column({ default: 1 })
  version: number;

  /** Processing status */
  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  /** Error message if processing failed */
  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  /** Number of chunks generated */
  @Column({ default: 0 })
  chunkCount: number;

  /** Extracted text character count */
  @Column({ default: 0 })
  characterCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
