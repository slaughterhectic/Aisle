import { ConfigService } from '@nestjs/config';
import { QdrantService } from './qdrant.service';
export interface SearchResult {
    documentId: string;
    chunkId: string;
    content: string;
    score: number;
}
export declare class VectorSearchService {
    private readonly qdrantService;
    private readonly configService;
    private readonly logger;
    private readonly embeddingClient;
    private readonly embeddingModel;
    constructor(qdrantService: QdrantService, configService: ConfigService);
    search(tenantId: string, assistantId: string, query: string, topK?: number): Promise<SearchResult[]>;
    upsertVectors(points: {
        id: string;
        vector: number[];
        payload: any;
    }[]): Promise<void>;
    deleteDocumentVectors(documentId: string): Promise<void>;
    private generateQueryEmbedding;
}
