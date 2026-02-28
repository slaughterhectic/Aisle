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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const knowledge_service_1 = require("./knowledge.service");
const knowledge_dto_1 = require("./dto/knowledge.dto");
const tenant_decorator_1 = require("../../common/decorators/tenant.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const tenant_context_interface_1 = require("../../common/interfaces/tenant-context.interface");
let KnowledgeController = class KnowledgeController {
    knowledgeService;
    constructor(knowledgeService) {
        this.knowledgeService = knowledgeService;
    }
    async upload(tenant, dto, file) {
        return this.knowledgeService.uploadDocument(tenant, dto, file);
    }
    async findAll(tenant, assistantId) {
        return this.knowledgeService.findAll(tenant, assistantId);
    }
    async findOne(tenant, id) {
        const doc = await this.knowledgeService.findOne(tenant, id);
        return {
            id: doc.id,
            assistantId: doc.assistantId,
            filename: doc.filename,
            mimeType: doc.mimeType,
            fileSize: Number(doc.fileSize),
            status: doc.status,
            chunkCount: doc.chunkCount,
            characterCount: doc.characterCount,
            version: doc.version,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
    async getContent(tenant, id, download, res) {
        const { stream, document } = await this.knowledgeService.getDocumentStream(tenant, id);
        res.set({
            'Content-Type': document.mimeType,
            'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${document.filename}"`,
        });
        stream.pipe(res);
    }
    async remove(tenant, id) {
        return this.knowledgeService.remove(tenant, id);
    }
};
exports.KnowledgeController = KnowledgeController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, roles_decorator_1.Roles)(tenant_context_interface_1.UserRole.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, tenant_decorator_1.Tenant)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, knowledge_dto_1.UploadDocumentDto, Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, tenant_decorator_1.Tenant)()),
    __param(1, (0, common_1.Query)('assistantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, tenant_decorator_1.Tenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/content'),
    __param(0, (0, tenant_decorator_1.Tenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('download')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Boolean, Object]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "getContent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(tenant_context_interface_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, tenant_decorator_1.Tenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KnowledgeController.prototype, "remove", null);
exports.KnowledgeController = KnowledgeController = __decorate([
    (0, common_1.Controller)('knowledge'),
    __metadata("design:paramtypes", [knowledge_service_1.KnowledgeService])
], KnowledgeController);
//# sourceMappingURL=knowledge.controller.js.map