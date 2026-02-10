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
var LlmGatewayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlmGatewayService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_provider_1 = require("./providers/openai.provider");
const anthropic_provider_1 = require("./providers/anthropic.provider");
let LlmGatewayService = LlmGatewayService_1 = class LlmGatewayService {
    configService;
    openaiProvider;
    anthropicProvider;
    logger = new common_1.Logger(LlmGatewayService_1.name);
    providers = new Map();
    defaultProvider;
    constructor(configService, openaiProvider, anthropicProvider) {
        this.configService = configService;
        this.openaiProvider = openaiProvider;
        this.anthropicProvider = anthropicProvider;
        this.providers.set('openai', openaiProvider);
        this.providers.set('anthropic', anthropicProvider);
        this.defaultProvider = this.configService.get('llm.defaultProvider') || 'openai';
    }
    async chat(messages, options) {
        const providerName = options.provider || this.defaultProvider;
        const provider = this.providers.get(providerName);
        if (!provider) {
            throw new common_1.BadRequestException(`Unknown LLM provider: ${providerName}`);
        }
        if (!provider.isAvailable()) {
            throw new common_1.BadRequestException(`LLM provider ${providerName} is not configured`);
        }
        const llmOptions = {
            model: options.model || this.getDefaultModel(providerName),
            temperature: options.temperature,
            maxTokens: options.maxTokens,
        };
        const startTime = Date.now();
        try {
            const response = await provider.chat(messages, llmOptions);
            const latencyMs = Date.now() - startTime;
            this.logger.log(`LLM call completed: provider=${providerName}, model=${response.model}, ` +
                `tokens=${response.usage.totalTokens}, latency=${latencyMs}ms`);
            return response;
        }
        catch (error) {
            this.logger.error(`LLM call failed: provider=${providerName}`, error);
            throw error;
        }
    }
    getDefaultModel(provider) {
        switch (provider) {
            case 'openai':
                return this.configService.get('llm.defaultModel') || 'gpt-4o-mini';
            case 'anthropic':
                return 'claude-3-sonnet-20240229';
            default:
                return 'gpt-4o-mini';
        }
    }
    getAvailableProviders() {
        return Array.from(this.providers.entries())
            .filter(([_, provider]) => provider.isAvailable())
            .map(([name]) => name);
    }
    countTokens(text, provider) {
        const providerName = provider || this.defaultProvider;
        const p = this.providers.get(providerName);
        return p?.countTokens(text) || Math.ceil(text.length / 4);
    }
};
exports.LlmGatewayService = LlmGatewayService;
exports.LlmGatewayService = LlmGatewayService = LlmGatewayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        openai_provider_1.OpenAIProvider,
        anthropic_provider_1.AnthropicProvider])
], LlmGatewayService);
//# sourceMappingURL=llm-gateway.service.js.map