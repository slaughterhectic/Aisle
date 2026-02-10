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
exports.Document = exports.DocumentStatus = void 0;
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("./tenant.entity");
const assistant_entity_1 = require("./assistant.entity");
var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["PENDING"] = "pending";
    DocumentStatus["PROCESSING"] = "processing";
    DocumentStatus["COMPLETED"] = "completed";
    DocumentStatus["FAILED"] = "failed";
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
let Document = class Document {
    id;
    tenantId;
    tenant;
    assistantId;
    assistant;
    filename;
    s3Key;
    mimeType;
    fileSize;
    version;
    status;
    errorMessage;
    chunkCount;
    characterCount;
    createdAt;
    updatedAt;
};
exports.Document = Document;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Document.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Document.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tenantId' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], Document.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], Document.prototype, "assistantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => assistant_entity_1.Assistant, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'assistantId' }),
    __metadata("design:type", assistant_entity_1.Assistant)
], Document.prototype, "assistant", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Document.prototype, "filename", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500 }),
    __metadata("design:type", String)
], Document.prototype, "s3Key", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Document.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Document.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], Document.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DocumentStatus,
        default: DocumentStatus.PENDING,
    }),
    __metadata("design:type", String)
], Document.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Document.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Document.prototype, "chunkCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Document.prototype, "characterCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Document.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Document.prototype, "updatedAt", void 0);
exports.Document = Document = __decorate([
    (0, typeorm_1.Entity)('documents'),
    (0, typeorm_1.Index)(['tenantId', 'assistantId'])
], Document);
//# sourceMappingURL=document.entity.js.map