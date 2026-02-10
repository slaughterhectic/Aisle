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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentChunk = void 0;
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("./tenant.entity");
const document_entity_1 = require("./document.entity");
let DocumentChunk = class DocumentChunk {
    id;
    tenantId;
    tenant;
    documentId;
    document;
    content;
    chunkIndex;
    startOffset;
    endOffset;
    tokenCount;
    embeddingId;
    createdAt;
};
exports.DocumentChunk = DocumentChunk;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DocumentChunk.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DocumentChunk.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tenantId' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], DocumentChunk.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], DocumentChunk.prototype, "documentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => document_entity_1.Document, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'documentId' }),
    __metadata("design:type", document_entity_1.Document)
], DocumentChunk.prototype, "document", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], DocumentChunk.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DocumentChunk.prototype, "chunkIndex", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DocumentChunk.prototype, "startOffset", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DocumentChunk.prototype, "endOffset", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], DocumentChunk.prototype, "tokenCount", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], DocumentChunk.prototype, "embeddingId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DocumentChunk.prototype, "createdAt", void 0);
exports.DocumentChunk = DocumentChunk = __decorate([
    (0, typeorm_1.Entity)('document_chunks'),
    (0, typeorm_1.Index)(['tenantId', 'documentId'])
], DocumentChunk);
//# sourceMappingURL=document-chunk.entity.js.map