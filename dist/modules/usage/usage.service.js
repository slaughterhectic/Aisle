"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UsageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const usage_log_entity_1 = require("../../database/entities/usage-log.entity");
let UsageService = UsageService_1 = class UsageService {
    usageLogRepository;
    logger = new common_1.Logger(UsageService_1.name);
    constructor(usageLogRepository) {
        this.usageLogRepository = usageLogRepository;
    }
    async logUsage(input) {
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
    async getSummary(tenant, startDate, endDate) {
        const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate || new Date();
        const logs = await this.usageLogRepository.find({
            where: {
                tenantId: tenant.tenantId,
                createdAt: (0, typeorm_2.Between)(start, end),
            },
        });
        const byModel = new Map();
        const byAssistant = new Map();
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
            }
            else {
                failedRequests++;
            }
            const modelStats = byModel.get(log.model) || { requests: 0, tokens: 0 };
            modelStats.requests++;
            modelStats.tokens += log.tokensTotal;
            byModel.set(log.model, modelStats);
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
    async getAssistantUsage(tenant, assistantId, startDate, endDate) {
        const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate || new Date();
        const logs = await this.usageLogRepository.find({
            where: {
                tenantId: tenant.tenantId,
                assistantId,
                createdAt: (0, typeorm_2.Between)(start, end),
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
};
exports.UsageService = UsageService;
exports.UsageService = UsageService = UsageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(usage_log_entity_1.UsageLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsageService);
//# sourceMappingURL=usage.service.js.map