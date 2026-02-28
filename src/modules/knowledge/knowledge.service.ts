import { Injectable, NotFoundException, BadRequestException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentStatus } from '../../database/entities/document.entity';
import { DocumentChunk } from '../../database/entities/document-chunk.entity';
import { StorageService } from './storage.service';
import { IngestionService } from '../ingestion/ingestion.service';
import { UploadDocumentDto, DocumentResponse } from './dto/knowledge.dto';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';

/**
 * Allowed MIME types for document upload
 */
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Knowledge Service
 * Manages document upload, storage, and metadata.
 */
@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(DocumentChunk)
    private readonly chunkRepository: Repository<DocumentChunk>,
    private readonly storageService: StorageService,
    @Inject(forwardRef(() => IngestionService))
    private readonly ingestionService: IngestionService,
  ) { }

  /**
   * Upload and process a document
   */
  async uploadDocument(
    tenant: TenantContext,
    dto: UploadDocumentDto,
    file: Express.Multer.File,
  ): Promise<DocumentResponse> {
    // Validate file
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: PDF, DOCX, TXT. Received: ${file.mimetype}`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(`File too large. Maximum size: 50MB`);
    }

    // Generate S3 key and upload
    const s3Key = this.storageService.generateKey(tenant.tenantId, file.originalname);
    await this.storageService.uploadFile(s3Key, file.buffer, file.mimetype);

    // Create document record
    const document = this.documentRepository.create({
      tenantId: tenant.tenantId,
      assistantId: dto.assistantId,
      filename: file.originalname,
      s3Key,
      mimeType: file.mimetype,
      fileSize: file.size,
      status: DocumentStatus.PENDING,
    });

    const saved = await this.documentRepository.save(document);

    // Trigger async ingestion
    this.ingestionService.queueDocument(saved.id).catch((err) => {
      this.logger.error(`Failed to queue document ${saved.id} for ingestion`, err);
    });

    return this.toResponse(saved);
  }

  /**
   * Get all documents for an assistant
   */
  async findAll(tenant: TenantContext, assistantId?: string): Promise<DocumentResponse[]> {
    const whereClause: any = { tenantId: tenant.tenantId };
    if (assistantId) {
      whereClause.assistantId = assistantId;
    }

    const documents = await this.documentRepository.find({
      where: whereClause,
      order: { createdAt: 'DESC' },
    });

    return documents.map((d) => this.toResponse(d));
  }

  /**
   * Get a specific document
   */
  async findOne(tenant: TenantContext, id: string): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id, tenantId: tenant.tenantId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID "${id}" not found`);
    }

    return document;
  }

  /**
   * Get a document's file stream
   */
  async getDocumentStream(
    tenant: TenantContext,
    id: string,
  ): Promise<{ stream: NodeJS.ReadableStream; document: Document }> {
    const document = await this.findOne(tenant, id);
    const stream = await this.storageService.getFileStream(document.s3Key);
    return { stream, document };
  }

  /**
   * Delete a document and its chunks
   */
  async remove(tenant: TenantContext, id: string): Promise<void> {
    const document = await this.findOne(tenant, id);

    // Delete chunks from database
    await this.chunkRepository.delete({ documentId: id, tenantId: tenant.tenantId });

    // Delete file from S3
    await this.storageService.deleteFile(document.s3Key);

    // Delete document record
    await this.documentRepository.remove(document);

    this.logger.log(`Deleted document ${id} and its chunks`);
  }

  /**
   * Update document status
   */
  async updateStatus(
    id: string,
    status: DocumentStatus,
    updates?: { chunkCount?: number; characterCount?: number; errorMessage?: string },
  ): Promise<void> {
    await this.documentRepository.update(id, {
      status,
      ...updates,
    });
  }

  private toResponse(document: Document): DocumentResponse {
    return {
      id: document.id,
      assistantId: document.assistantId,
      filename: document.filename,
      mimeType: document.mimeType,
      fileSize: Number(document.fileSize),
      status: document.status,
      chunkCount: document.chunkCount,
      characterCount: document.characterCount,
      version: document.version,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
