import { Repository } from 'typeorm';
import { Document } from '../../database/entities/document.entity';
import { DocumentChunk } from '../../database/entities/document-chunk.entity';
import { StorageService } from '../knowledge/storage.service';
import { ExtractionService } from './extraction.service';
import { ChunkingService } from './chunking.service';
import { EmbeddingService } from './embedding.service';
import { VectorSearchService } from '../vector-search/vector-search.service';
export declare class IngestionService {
    private readonly documentRepository;
    private readonly chunkRepository;
    private readonly storageService;
    private readonly extractionService;
    private readonly chunkingService;
    private readonly embeddingService;
    private readonly vectorSearchService;
    private readonly logger;
    constructor(documentRepository: Repository<Document>, chunkRepository: Repository<DocumentChunk>, storageService: StorageService, extractionService: ExtractionService, chunkingService: ChunkingService, embeddingService: EmbeddingService, vectorSearchService: VectorSearchService);
    queueDocument(documentId: string): Promise<void>;
    processDocument(documentId: string): Promise<void>;
    private generateEmbeddingsInBatches;
    private storeChunksAndEmbeddings;
    private updateDocumentStatus;
}
