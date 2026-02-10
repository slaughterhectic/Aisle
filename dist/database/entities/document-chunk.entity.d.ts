import { Tenant } from './tenant.entity';
import { Document } from './document.entity';
export declare class DocumentChunk {
    id: string;
    tenantId: string;
    tenant: Tenant;
    documentId: string;
    document: Document;
    content: string;
    chunkIndex: number;
    startOffset: number;
    endOffset: number;
    tokenCount: number;
    embeddingId: string;
    createdAt: Date;
}
