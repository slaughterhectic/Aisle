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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AnthropicProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
let AnthropicProvider = AnthropicProvider_1 = class AnthropicProvider {
    configService;
    logger = new common_1.Logger(AnthropicProvider_1.name);
    client;
    name = 'anthropic';
    constructor(configService) {
        this.configService = configService;
        this.client = new sdk_1.default({
            apiKey: this.configService.get('llm.anthropicApiKey'),
        });
    }
    isAvailable() {
        return !!this.configService.get('llm.anthropicApiKey');
    }
    async chat(messages, options) {
        try {
            const systemMessage = messages.find((m) => m.role === 'system');
            const chatMessages = messages
                .filter((m) => m.role !== 'system')
                .map((m) => ({
                role: m.role,
                content: m.content,
            }));
            const response = await this.client.messages.create({
                model: options.model || 'claude-3-sonnet-20240229',
                system: systemMessage?.content || '',
                messages: chatMessages,
                max_tokens: options.maxTokens ?? 2048,
                temperature: options.temperature ?? 0.7,
                top_p: options.topP ?? 1,
            });
            const content = response.content[0];
            const textContent = content.type === 'text' ? content.text : '';
            return {
                content: textContent,
                model: response.model,
                usage: {
                    promptTokens: response.usage.input_tokens,
                    completionTokens: response.usage.output_tokens,
                    totalTokens: response.usage.input_tokens + response.usage.output_tokens,
                },
                finishReason: this.mapStopReason(response.stop_reason),
            };
        }
        catch (error) {
            this.logger.error('Anthropic API call failed', error);
            throw error;
        }
    }
    countTokens(text) {
        return Math.ceil(text.length / 4);
    }
    mapStopReason(reason) {
        switch (reason) {
            case 'end_turn':
            case 'stop_sequence':
                return 'stop';
            case 'max_tokens':
                return 'length';
            default:
                return 'stop';
        }
    }
};
exports.AnthropicProvider = AnthropicProvider;
exports.AnthropicProvider = AnthropicProvider = AnthropicProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AnthropicProvider);
//# sourceMappingURL=anthropic.provider.js.map