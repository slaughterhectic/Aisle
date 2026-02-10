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
var KnowledgeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const document_entity_1 = require("../../database/entities/document.entity");
const document_chunk_entity_1 = require("../../database/entities/document-chunk.entity");
const storage_service_1 = require("./storage.service");
const ingestion_service_1 = require("../ingestion/ingestion.service");
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
];
const MAX_FILE_SIZE = 50 * 1024 * 1024;
let KnowledgeService = KnowledgeService_1 = class KnowledgeService {
    documentRepository;
    chunkRepository;
    storageService;
    ingestionService;
    logger = new common_1.Logger(KnowledgeService_1.name);
    constructor(documentRepository, chunkRepository, storageService, ingestionService) {
        this.documentRepository = documentRepository;
        this.chunkRepository = chunkRepository;
        this.storageService = storageService;
        this.ingestionService = ingestionService;
    }
    async uploadDocument(tenant, dto, file) {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`Invalid file type. Allowed: PDF, DOCX, TXT. Received: ${file.mimetype}`);
        }
        if (file.size > MAX_FILE_SIZE) {
            throw new common_1.BadRequestException(`File too large. Maximum size: 50MB`);
        }
        const s3Key = this.storageService.generateKey(tenant.tenantId, file.originalname);
        await this.storageService.uploadFile(s3Key, file.buffer, file.mimetype);
        const document = this.documentRepository.create({
            tenantId: tenant.tenantId,
            assistantId: dto.assistantId,
            filename: file.originalname,
            s3Key,
            mimeType: file.mimetype,
            fileSize: file.size,
            status: document_entity_1.DocumentStatus.PENDING,
        });
        const saved = await this.documentRepository.save(document);
        this.ingestionService.queueDocument(saved.id).catch((err) => {
            this.logger.error(`Failed to queue document ${saved.id} for ingestion`, err);
        });
        return this.toResponse(saved);
    }
    async findAll(tenant, assistantId) {
        const whereClause = { tenantId: tenant.tenantId };
        if (assistantId) {
            whereClause.assistantId = assistantId;
        }
        const documents = await this.documentRepository.find({
            where: whereClause,
            order: { createdAt: 'DESC' },
        });
        return documents.map((d) => this.toResponse(d));
    }
    async findOne(tenant, id) {
        const document = await this.documentRepository.findOne({
            where: { id, tenantId: tenant.tenantId },
        });
        if (!document) {
            throw new common_1.NotFoundException(`Document with ID "${id}" not found`);
        }
        return document;
    }
    async remove(tenant, id) {
        const document = await this.findOne(tenant, id);
        await this.chunkRepository.delete({ documentId: id, tenantId: tenant.tenantId });
        await this.storageService.deleteFile(document.s3Key);
        await this.documentRepository.remove(document);
        this.logger.log(`Deleted document ${id} and its chunks`);
    }
    async updateStatus(id, status, updates) {
        await this.documentRepository.update(id, {
            status,
            ...updates,
        });
    }
    toResponse(document) {
        return {
            id: document.id,
            assistantId: document.assistantId,
            filename: document.filename,
            mimeType: document.mimeType,
            fileSize: Number(document.fileSize),
            status: document.status,
            chunkCount: document.chunkCount,
            characterCount: document.characterCount,
            version: document.version,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
    }
};
exports.KnowledgeService = KnowledgeService;
exports.KnowledgeService = KnowledgeService = KnowledgeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(document_entity_1.Document)),
    __param(1, (0, typeorm_1.InjectRepository)(document_chunk_entity_1.DocumentChunk)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => ingestion_service_1.IngestionService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        storage_service_1.StorageService,
        ingestion_service_1.IngestionService])
], KnowledgeService);
//# sourceMappingURL=knowledge.service.js.map