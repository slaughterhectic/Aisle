import { UsageService, UsageSummary } from './usage.service';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
export declare class UsageController {
    private readonly usageService;
    constructor(usageService: UsageService);
    getSummary(tenant: TenantContext, startDate?: string, endDate?: string): Promise<UsageSummary>;
    getAssistantUsage(tenant: TenantContext, id: string, startDate?: string, endDate?: string): Promise<{
        totalRequests: number;
        totalTokens: number;
        logs: import("../../database/entities").UsageLog[];
    }>;
}
