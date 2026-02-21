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
exports.Assistant = exports.LLMProvider = void 0;
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("./tenant.entity");
var LLMProvider;
(function (LLMProvider) {
    LLMProvider["OPENAI"] = "openai";
    LLMProvider["ANTHROPIC"] = "anthropic";
    LLMProvider["OPENROUTER"] = "openrouter";
    LLMProvider["MISTRAL"] = "mistral";
})(LLMProvider || (exports.LLMProvider = LLMProvider = {}));
let Assistant = class Assistant {
    id;
    tenantId;
    tenant;
    name;
    description;
    systemPrompt;
    provider;
    model;
    temperature;
    maxTokens;
    ragEnabled;
    ragTopK;
    isActive;
    createdAt;
    updatedAt;
};
exports.Assistant = Assistant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Assistant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Assistant.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tenantId' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], Assistant.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Assistant.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Assistant.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Assistant.prototype, "systemPrompt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: LLMProvider,
        default: LLMProvider.OPENAI,
    }),
    __metadata("design:type", String)
], Assistant.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, default: 'gpt-4o-mini' }),
    __metadata("design:type", String)
], Assistant.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, default: 0.7 }),
    __metadata("design:type", Number)
], Assistant.prototype, "temperature", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 2048 }),
    __metadata("design:type", Number)
], Assistant.prototype, "maxTokens", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Assistant.prototype, "ragEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 5 }),
    __metadata("design:type", Number)
], Assistant.prototype, "ragTopK", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Assistant.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Assistant.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Assistant.prototype, "updatedAt", void 0);
exports.Assistant = Assistant = __decorate([
    (0, typeorm_1.Entity)('assistants')
], Assistant);
//# sourceMappingURL=assistant.entity.js.map