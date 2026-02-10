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
var VectorSearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorSearchService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const qdrant_service_1 = require("./qdrant.service");
const openai_1 = __importDefault(require("openai"));
let VectorSearchService = VectorSearchService_1 = class VectorSearchService {
    qdrantService;
    configService;
    logger = new common_1.Logger(VectorSearchService_1.name);
    openai;
    embeddingModel;
    constructor(qdrantService, configService) {
        this.qdrantService = qdrantService;
        this.configService = configService;
        this.openai = new openai_1.default({
            apiKey: this.configService.get('llm.openaiApiKey'),
        });
        this.embeddingModel = this.configService.get('llm.defaultEmbeddingModel') || 'text-embedding-3-small';
    }
    async search(tenantId, assistantId, query, topK = 5) {
        try {
            const queryEmbedding = await this.generateQueryEmbedding(query);
            const results = await this.qdrantService.search(queryEmbedding, tenantId, assistantId, topK);
            return results.map((r) => ({
                documentId: r.payload.documentId,
                chunkId: r.id,
                content: r.payload.content,
                score: r.score,
            }));
        }
        catch (error) {
            this.logger.error('Vector search failed', error);
            throw error;
        }
    }
    async upsertVectors(points) {
        await this.qdrantService.upsert(points);
    }
    async deleteDocumentVectors(documentId) {
        await this.qdrantService.deleteByDocumentId(documentId);
    }
    async generateQueryEmbedding(query) {
        const response = await this.openai.embeddings.create({
            model: this.embeddingModel,
            input: query,
        });
        return response.data[0].embedding;
    }
};
exports.VectorSearchService = VectorSearchService;
exports.VectorSearchService = VectorSearchService = VectorSearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [qdrant_service_1.QdrantService,
        config_1.ConfigService])
], VectorSearchService);
//# sourceMappingURL=vector-search.service.js.map