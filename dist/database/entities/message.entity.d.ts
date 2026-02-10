import { Tenant } from './tenant.entity';
import { Conversation } from './conversation.entity';
export declare enum MessageRole {
    SYSTEM = "system",
    USER = "user",
    ASSISTANT = "assistant"
}
export declare class Message {
    id: string;
    tenantId: string;
    tenant: Tenant;
    conversationId: string;
    conversation: Conversation;
    role: MessageRole;
    content: string;
    tokensUsed: number;
    contextChunks: ContextChunk[];
    model: string;
    createdAt: Date;
}
export interface ContextChunk {
    documentId: string;
    chunkId: string;
    content: string;
    score: number;
}
