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
var QdrantService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QdrantService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const js_client_rest_1 = require("@qdrant/js-client-rest");
let QdrantService = QdrantService_1 = class QdrantService {
    configService;
    logger = new common_1.Logger(QdrantService_1.name);
    client;
    collectionName;
    vectorSize = 1536;
    constructor(configService) {
        this.configService = configService;
        const url = this.configService.get('qdrant.url') || 'http://localhost:6333';
        this.client = new js_client_rest_1.QdrantClient({ url });
        this.collectionName = this.configService.get('qdrant.collectionName') || 'documents';
    }
    async onModuleInit() {
        try {
            await this.ensureCollectionExists();
        }
        catch (error) {
            this.logger.warn('Failed to initialize Qdrant collection. Will retry on first operation.', error);
        }
    }
    async ensureCollectionExists() {
        try {
            const collections = await this.client.getCollections();
            const exists = collections.collections.some((c) => c.name === this.collectionName);
            if (!exists) {
                await this.client.createCollection(this.collectionName, {
                    vectors: {
                        size: this.vectorSize,
                        distance: 'Cosine',
                    },
                });
                await this.client.createPayloadIndex(this.collectionName, {
                    field_name: 'tenantId',
                    field_schema: 'keyword',
                });
                await this.client.createPayloadIndex(this.collectionName, {
                    field_name: 'assistantId',
                    field_schema: 'keyword',
                });
                this.logger.log(`Created Qdrant collection: ${this.collectionName}`);
            }
        }
        catch (error) {
            this.logger.error('Failed to ensure Qdrant collection exists', error);
            throw error;
        }
    }
    async upsert(points) {
        await this.ensureCollectionExists();
        await this.client.upsert(this.collectionName, {
            points: points.map((p) => ({
                id: p.id,
                vector: p.vector,
                payload: p.payload,
            })),
        });
    }
    async search(vector, tenantId, assistantId, limit = 5, scoreThreshold = 0.7) {
        await this.ensureCollectionExists();
        const filter = {
            must: [{ key: 'tenantId', match: { value: tenantId } }],
        };
        if (assistantId) {
            filter.must.push({ key: 'assistantId', match: { value: assistantId } });
        }
        const results = await this.client.search(this.collectionName, {
            vector,
            limit,
            filter,
            score_threshold: scoreThreshold,
            with_payload: true,
        });
        return results.map((r) => ({
            id: r.id,
            score: r.score,
            payload: r.payload,
        }));
    }
    async deleteByDocumentId(documentId) {
        await this.client.delete(this.collectionName, {
            filter: {
                must: [{ key: 'documentId', match: { value: documentId } }],
            },
        });
    }
    async deleteByTenantId(tenantId) {
        await this.client.delete(this.collectionName, {
            filter: {
                must: [{ key: 'tenantId', match: { value: tenantId } }],
            },
        });
    }
};
exports.QdrantService = QdrantService;
exports.QdrantService = QdrantService = QdrantService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], QdrantService);
//# sourceMappingURL=qdrant.service.js.map