import { ConfigService } from '@nestjs/config';
import { MessageRole } from '../../database/entities/message.entity';
export interface SessionState {
    conversationId: string;
    tenantId: string;
    assistantId: string;
    userId: string;
    recentMessages: SessionMessage[];
    lastActivity: number;
    summary?: string;
}
export interface SessionMessage {
    role: MessageRole;
    content: string;
    timestamp: number;
}
export declare class SessionService {
    private readonly configService;
    private readonly logger;
    private readonly redis;
    private readonly sessionTtl;
    private readonly maxRecentMessages;
    constructor(configService: ConfigService);
    private getSessionKey;
    getSession(conversationId: string): Promise<SessionState | null>;
    createSession(session: SessionState): Promise<void>;
    addMessage(conversationId: string, message: SessionMessage): Promise<void>;
    updateSummary(conversationId: string, summary: string): Promise<void>;
    deleteSession(conversationId: string): Promise<void>;
    refreshSession(conversationId: string): Promise<void>;
}
