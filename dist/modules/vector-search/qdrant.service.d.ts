import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class QdrantService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private readonly client;
    private readonly collectionName;
    private readonly vectorSize;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    ensureCollectionExists(): Promise<void>;
    upsert(points: {
        id: string;
        vector: number[];
        payload: Record<string, any>;
    }[]): Promise<void>;
    search(vector: number[], tenantId: string, assistantId?: string, limit?: number, scoreThreshold?: number): Promise<{
        id: string;
        score: number;
        payload: Record<string, any>;
    }[]>;
    deleteByDocumentId(documentId: string): Promise<void>;
    deleteByTenantId(tenantId: string): Promise<void>;
}
