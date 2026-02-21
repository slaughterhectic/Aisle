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
var EmbeddingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = __importDefault(require("openai"));
let EmbeddingService = EmbeddingService_1 = class EmbeddingService {
    configService;
    logger = new common_1.Logger(EmbeddingService_1.name);
    client;
    model;
    constructor(configService) {
        this.configService = configService;
        const defaultProvider = this.configService.get('llm.defaultProvider') || 'openai';
        const openrouterKey = this.configService.get('llm.openrouterApiKey');
        const openaiKey = this.configService.get('llm.openaiApiKey');
        if (defaultProvider === 'openrouter' && openrouterKey && openrouterKey !== 'your-openrouter-api-key') {
            this.client = new openai_1.default({
                apiKey: openrouterKey,
                baseURL: 'https://openrouter.ai/api/v1',
            });
            this.model = 'openai/text-embedding-3-small';
            this.logger.log('EmbeddingService using OpenRouter');
        }
        else if (openaiKey && openaiKey !== 'your-openai-api-key') {
            this.client = new openai_1.default({ apiKey: openaiKey });
            this.model = this.configService.get('llm.defaultEmbeddingModel') || 'text-embedding-3-small';
            this.logger.log('EmbeddingService using OpenAI');
        }
        else {
            this.client = new openai_1.default({ apiKey: 'missing' });
            this.model = 'text-embedding-3-small';
            this.logger.warn('EmbeddingService: No valid API key found.');
        }
    }
    async generateEmbeddings(texts) {
        if (texts.length === 0)
            return [];
        try {
            const response = await this.client.embeddings.create({ model: this.model, input: texts });
            return response.data.map((item) => item.embedding);
        }
        catch (error) {
            this.logger.error('Failed to generate embeddings', error);
            throw error;
        }
    }
    async generateEmbedding(text) {
        const embeddings = await this.generateEmbeddings([text]);
        return embeddings[0];
    }
    getEmbeddingDimension() {
        return 1536;
    }
};
exports.EmbeddingService = EmbeddingService;
exports.EmbeddingService = EmbeddingService = EmbeddingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmbeddingService);
//# sourceMappingURL=embedding.service.js.map