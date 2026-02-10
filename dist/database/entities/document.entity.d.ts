import { Tenant } from './tenant.entity';
import { Assistant } from './assistant.entity';
export declare enum DocumentStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare class Document {
    id: string;
    tenantId: string;
    tenant: Tenant;
    assistantId: string;
    assistant: Assistant;
    filename: string;
    s3Key: string;
    mimeType: string;
    fileSize: number;
    version: number;
    status: DocumentStatus;
    errorMessage: string;
    chunkCount: number;
    characterCount: number;
    createdAt: Date;
    updatedAt: Date;
}
