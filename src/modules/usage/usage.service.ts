import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UsageLog } from '../../database/entities/usage-log.entity';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';

/**
 * Usage log input
 */
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

/**
 * Usage summary response
 */
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

/**
 * Usage Service
 * Tracks and aggregates token usage for billing and analytics.
 */
@Injectable()
export class UsageService {
  private readonly logger = new Logger(UsageService.name);

  constructor(
    @InjectRepository(UsageLog)
    private readonly usageLogRepository: Repository<UsageLog>,
  ) {}

  /**
   * Log a usage event
   */
  async logUsage(input: UsageLogInput): Promise<void> {
    const log = this.usageLogRepository.create({
      tenantId: input.tenantId,
      assistantId: input.assistantId,
      userId: input.userId,
      conversationId: input.conversationId,
      tokensInput: input.tokensInput,
      tokensOutput: input.tokensOutput,
      tokensTotal: input.tokensInput + input.tokensOutput,
      model: input.model,
      provider: input.provider,
      latencyMs: input.latencyMs,
      success: input.success,
      errorMessage: input.errorMessage,
    });

    await this.usageLogRepository.save(log);
  }

  /**
   * Get usage summary for a tenant
   */
  async getSummary(tenant: TenantContext, startDate?: Date, endDate?: Date): Promise<UsageSummary> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: 30 days
    const end = endDate || new Date();

    // Get all logs for the period
    const logs = await this.usageLogRepository.find({
      where: {
        tenantId: tenant.tenantId,
        createdAt: Between(start, end),
      },
    });

    // Aggregate by model
    const byModel = new Map<string, { requests: number; tokens: number }>();
    const byAssistant = new Map<string, { requests: number; tokens: number }>();

    let totalTokensInput = 0;
    let totalTokensOutput = 0;
    let totalLatency = 0;
    let successfulRequests = 0;
    let failedRequests = 0;

    for (const log of logs) {
      totalTokensInput += log.tokensInput;
      totalTokensOutput += log.tokensOutput;
      totalLatency += log.latencyMs || 0;

      if (log.success) {
        successfulRequests++;
      } else {
        failedRequests++;
      }

      // By model
      const modelStats = byModel.get(log.model) || { requests: 0, tokens: 0 };
      modelStats.requests++;
      modelStats.tokens += log.tokensTotal;
      byModel.set(log.model, modelStats);

      // By assistant
      const assistantStats = byAssistant.get(log.assistantId) || { requests: 0, tokens: 0 };
      assistantStats.requests++;
      assistantStats.tokens += log.tokensTotal;
      byAssistant.set(log.assistantId, assistantStats);
    }

    return {
      period: { start, end },
      totalRequests: logs.length,
      successfulRequests,
      failedRequests,
      totalTokensInput,
      totalTokensOutput,
      totalTokens: totalTokensInput + totalTokensOutput,
      averageLatencyMs: logs.length > 0 ? Math.round(totalLatency / logs.length) : 0,
      byModel: Array.from(byModel.entries()).map(([model, stats]) => ({
        model,
        ...stats,
      })),
      byAssistant: Array.from(byAssistant.entries()).map(([assistantId, stats]) => ({
        assistantId,
        ...stats,
      })),
    };
  }

  /**
   * Get usage for a specific assistant
   */
  async getAssistantUsage(
    tenant: TenantContext,
    assistantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ totalRequests: number; totalTokens: number; logs: UsageLog[] }> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const logs = await this.usageLogRepository.find({
      where: {
        tenantId: tenant.tenantId,
        assistantId,
        createdAt: Between(start, end),
      },
      order: { createdAt: 'DESC' },
      take: 100,
    });

    const totalTokens = logs.reduce((sum, log) => sum + log.tokensTotal, 0);

    return {
      totalRequests: logs.length,
      totalTokens,
      logs,
    };
  }
}
