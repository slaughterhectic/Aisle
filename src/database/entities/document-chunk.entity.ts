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
import { Document } from './document.entity';

/**
 * Document Chunk Entity
 * Represents a chunk of text extracted from a document for RAG.
 * The actual embedding is stored in Qdrant, referenced by embeddingId.
 */
@Entity('document_chunks')
@Index(['tenantId', 'documentId'])
export class DocumentChunk {
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
  documentId: string;

  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'documentId' })
  document: Document;

  /** The actual text content of this chunk */
  @Column({ type: 'text' })
  content: string;

  /** Position of chunk in the document (0-indexed) */
  @Column()
  chunkIndex: number;

  /** Character offset where this chunk starts in the original text */
  @Column()
  startOffset: number;

  /** Character offset where this chunk ends in the original text */
  @Column()
  endOffset: number;

  /** Token count for this chunk */
  @Column({ default: 0 })
  tokenCount: number;

  /** Reference to the embedding ID in Qdrant (UUID) */
  @Column('uuid', { nullable: true })
  embeddingId: string;

  @CreateDateColumn()
  createdAt: Date;
}
