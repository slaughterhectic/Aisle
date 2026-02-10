import { Tenant } from './tenant.entity';
import { Assistant } from './assistant.entity';
import { User } from './user.entity';
export declare class UsageLog {
    id: string;
    tenantId: string;
    tenant: Tenant;
    assistantId: string;
    assistant: Assistant;
    userId: string;
    user: User;
    conversationId: string;
    tokensInput: number;
    tokensOutput: number;
    tokensTotal: number;
    model: string;
    provider: string;
    latencyMs: number;
    success: boolean;
    errorMessage: string;
    createdAt: Date;
}
