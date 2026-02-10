import { Repository } from 'typeorm';
import { UsageLog } from '../../database/entities/usage-log.entity';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
export interface UsageLogInput {
    tenantId: string;
    assistantId: string;
    userId: string;
    conversationId?: string;
    tokensInput: number;
    tokensOutput: number;
    model: string;
    provider: string;
    latencyMs?: number;
    success: boolean;
    errorMessage?: string;
}
export interface UsageSummary {
    period: {
        start: Date;
        end: Date;
    };
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalTokensInput: number;
    totalTokensOutput: number;
    totalTokens: number;
    averageLatencyMs: number;
    byModel: {
        model: string;
        requests: number;
        tokens: number;
    }[];
    byAssistant: {
        assistantId: string;
        requests: number;
        tokens: number;
    }[];
}
export declare class UsageService {
    private readonly usageLogRepository;
    private readonly logger;
    constructor(usageLogRepository: Repository<UsageLog>);
    logUsage(input: UsageLogInput): Promise<void>;
    getSummary(tenant: TenantContext, startDate?: Date, endDate?: Date): Promise<UsageSummary>;
    getAssistantUsage(tenant: TenantContext, assistantId: string, startDate?: Date, endDate?: Date): Promise<{
        totalRequests: number;
        totalTokens: number;
        logs: UsageLog[];
    }>;
}
