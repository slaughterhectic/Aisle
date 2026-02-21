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
var MistralProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MistralProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = __importDefault(require("openai"));
let MistralProvider = MistralProvider_1 = class MistralProvider {
    configService;
    logger = new common_1.Logger(MistralProvider_1.name);
    client;
    name = 'mistral';
    constructor(configService) {
        this.configService = configService;
        this.client = new openai_1.default({
            apiKey: this.configService.get('llm.mistralApiKey') || 'missing',
            baseURL: 'https://api.mistral.ai/v1',
        });
    }
    isAvailable() {
        const key = this.configService.get('llm.mistralApiKey');
        return !!key && key !== 'missing';
    }
    async chat(messages, options) {
        let params = {};
        try {
            params = {
                model: options.model || 'mistral-small-latest',
                messages: messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                })),
                temperature: options.temperature ?? 0.7,
                max_tokens: options.maxTokens ?? 2048,
                top_p: options.topP ?? 1,
            };
            if (options.stop && options.stop.length > 0) {
                params.stop = options.stop;
            }
            const response = await this.client.chat.completions.create(params);
            const choice = response.choices[0];
            return {
                content: choice.message.content || '',
                model: response.model,
                usage: {
                    promptTokens: response.usage?.prompt_tokens || 0,
                    completionTokens: response.usage?.completion_tokens || 0,
                    totalTokens: response.usage?.total_tokens || 0,
                },
                finishReason: this.mapFinishReason(choice.finish_reason),
            };
        }
        catch (error) {
            if (error.response || error.error) {
                this.logger.error('Mistral API call failed with response', JSON.stringify(error.response?.data || error.error));
            }
            else {
                this.logger.error('Mistral API call failed', error);
            }
            try {
                const fs = require('fs');
                fs.writeFileSync('/home/gourav/Desktop/Aisle/mistral_err.txt', JSON.stringify({
                    params,
                    error: error.response?.data || error.error || error.message
                }, null, 2));
            }
            catch (e) { }
            throw error;
        }
    }
    countTokens(text) {
        return Math.ceil(text.length / 4);
    }
    mapFinishReason(reason) {
        switch (reason) {
            case 'stop':
                return 'stop';
            case 'length':
                return 'length';
            case 'content_filter':
                return 'content_filter';
            default:
                return 'stop';
        }
    }
};
exports.MistralProvider = MistralProvider;
exports.MistralProvider = MistralProvider = MistralProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MistralProvider);
//# sourceMappingURL=mistral.provider.js.map