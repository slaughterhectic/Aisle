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
var IngestionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const document_entity_1 = require("../../database/entities/document.entity");
const document_chunk_entity_1 = require("../../database/entities/document-chunk.entity");
const storage_service_1 = require("../knowledge/storage.service");
const extraction_service_1 = require("./extraction.service");
const chunking_service_1 = require("./chunking.service");
const embedding_service_1 = require("./embedding.service");
const vector_search_service_1 = require("../vector-search/vector-search.service");
let IngestionService = IngestionService_1 = class IngestionService {
    documentRepository;
    chunkRepository;
    storageService;
    extractionService;
    chunkingService;
    embeddingService;
    vectorSearchService;
    logger = new common_1.Logger(IngestionService_1.name);
    constructor(documentRepository, chunkRepository, storageService, extractionService, chunkingService, embeddingService, vectorSearchService) {
        this.documentRepository = documentRepository;
        this.chunkRepository = chunkRepository;
        this.storageService = storageService;
        this.extractionService = extractionService;
        this.chunkingService = chunkingService;
        this.embeddingService = embeddingService;
        this.vectorSearchService = vectorSearchService;
    }
    async queueDocument(documentId) {
        setImmediate(() => {
            this.processDocument(documentId).catch((err) => {
                this.logger.error(`Failed to process document ${documentId}`, err);
            });
        });
    }
    async processDocument(documentId) {
        const document = await this.documentRepository.findOne({
            where: { id: documentId },
        });
        if (!document) {
            this.logger.error(`Document ${documentId} not found`);
            return;
        }
        try {
            await this.updateDocumentStatus(documentId, document_entity_1.DocumentStatus.PROCESSING);
            this.logger.log(`Downloading document ${documentId} from S3`);
            const buffer = await this.storageService.downloadFile(document.s3Key);
            this.logger.log(`Extracting text from document ${documentId}`);
            const text = await this.extractionService.extractText(buffer, document.mimeType);
            if (!text || text.trim().length === 0) {
                throw new Error('No text content extracted from document');
            }
            this.logger.log(`Chunking document ${documentId}`);
            const chunks = this.chunkingService.chunkText(text);
            if (chunks.length === 0) {
                throw new Error('No chunks generated from document');
            }
            this.logger.log(`Generating embeddings for ${chunks.length} chunks`);
            const embeddings = await this.generateEmbeddingsInBatches(chunks.map((c) => c.content));
            this.logger.log(`Storing chunks and embeddings for document ${documentId}`);
            await this.storeChunksAndEmbeddings(document, chunks, embeddings);
            await this.documentRepository.update(documentId, {
                status: document_entity_1.DocumentStatus.COMPLETED,
                chunkCount: chunks.length,
                characterCount: text.length,
            });
            this.logger.log(`Successfully processed document ${documentId}`);
        }
        catch (error) {
            this.logger.error(`Failed to process document ${documentId}`, error);
            await this.documentRepository.update(documentId, {
                status: document_entity_1.DocumentStatus.FAILED,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async generateEmbeddingsInBatches(texts, batchSize = 20) {
        const allEmbeddings = [];
        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            const embeddings = await this.embeddingService.generateEmbeddings(batch);
            allEmbeddings.push(...embeddings);
            if (i + batchSize < texts.length) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }
        return allEmbeddings;
    }
    async storeChunksAndEmbeddings(document, chunks, embeddings) {
        const chunkEntities = [];
        const vectorPoints = [];
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const embeddingId = (0, uuid_1.v4)();
            const chunkEntity = this.chunkRepository.create({
                tenantId: document.tenantId,
                documentId: document.id,
                content: chunk.content,
                chunkIndex: chunk.index,
                startOffset: chunk.startOffset,
                endOffset: chunk.endOffset,
                tokenCount: chunk.tokenCount,
                embeddingId,
            });
            chunkEntities.push(chunkEntity);
            vectorPoints.push({
                id: embeddingId,
                vector: embeddings[i],
                payload: {
                    tenantId: document.tenantId,
                    assistantId: document.assistantId,
                    documentId: document.id,
                    chunkIndex: chunk.index,
                    content: chunk.content,
                },
            });
        }
        await this.chunkRepository.save(chunkEntities);
        await this.vectorSearchService.upsertVectors(vectorPoints);
    }
    async updateDocumentStatus(documentId, status) {
        await this.documentRepository.update(documentId, { status });
    }
};
exports.IngestionService = IngestionService;
exports.IngestionService = IngestionService = IngestionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(document_entity_1.Document)),
    __param(1, (0, typeorm_1.InjectRepository)(document_chunk_entity_1.DocumentChunk)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => storage_service_1.StorageService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        storage_service_1.StorageService,
        extraction_service_1.ExtractionService,
        chunking_service_1.ChunkingService,
        embedding_service_1.EmbeddingService,
        vector_search_service_1.VectorSearchService])
], IngestionService);
//# sourceMappingURL=ingestion.service.js.map