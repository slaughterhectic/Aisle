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
exports.UsageLog = void 0;
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("./tenant.entity");
const assistant_entity_1 = require("./assistant.entity");
const user_entity_1 = require("./user.entity");
let UsageLog = class UsageLog {
    id;
    tenantId;
    tenant;
    assistantId;
    assistant;
    userId;
    user;
    conversationId;
    tokensInput;
    tokensOutput;
    tokensTotal;
    model;
    provider;
    latencyMs;
    success;
    errorMessage;
    createdAt;
};
exports.UsageLog = UsageLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UsageLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UsageLog.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tenantId' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], UsageLog.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], UsageLog.prototype, "assistantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => assistant_entity_1.Assistant, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'assistantId' }),
    __metadata("design:type", assistant_entity_1.Assistant)
], UsageLog.prototype, "assistant", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], UsageLog.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], UsageLog.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], UsageLog.prototype, "conversationId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UsageLog.prototype, "tokensInput", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UsageLog.prototype, "tokensOutput", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UsageLog.prototype, "tokensTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], UsageLog.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], UsageLog.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], UsageLog.prototype, "latencyMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], UsageLog.prototype, "success", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], UsageLog.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UsageLog.prototype, "createdAt", void 0);
exports.UsageLog = UsageLog = __decorate([
    (0, typeorm_1.Entity)('usage_logs'),
    (0, typeorm_1.Index)(['tenantId', 'createdAt']),
    (0, typeorm_1.Index)(['tenantId', 'assistantId'])
], UsageLog);
//# sourceMappingURL=usage-log.entity.js.map