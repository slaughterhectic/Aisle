import { Repository } from 'typeorm';
import { Document, DocumentStatus } from '../../database/entities/document.entity';
import { DocumentChunk } from '../../database/entities/document-chunk.entity';
import { StorageService } from './storage.service';
import { IngestionService } from '../ingestion/ingestion.service';
import { UploadDocumentDto, DocumentResponse } from './dto/knowledge.dto';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
export declare class KnowledgeService {
    private readonly documentRepository;
    private readonly chunkRepository;
    private readonly storageService;
    private readonly ingestionService;
    private readonly logger;
    constructor(documentRepository: Repository<Document>, chunkRepository: Repository<DocumentChunk>, storageService: StorageService, ingestionService: IngestionService);
    uploadDocument(tenant: TenantContext, dto: UploadDocumentDto, file: Express.Multer.File): Promise<DocumentResponse>;
    findAll(tenant: TenantContext, assistantId?: string): Promise<DocumentResponse[]>;
    findOne(tenant: TenantContext, id: string): Promise<Document>;
    getDocumentStream(tenant: TenantContext, id: string): Promise<{
        stream: NodeJS.ReadableStream;
        document: Document;
    }>;
    remove(tenant: TenantContext, id: string): Promise<void>;
    updateStatus(id: string, status: DocumentStatus, updates?: {
        chunkCount?: number;
        characterCount?: number;
        errorMessage?: string;
    }): Promise<void>;
    private toResponse;
}
