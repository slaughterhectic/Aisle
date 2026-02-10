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
exports.Conversation = void 0;
const typeorm_1 = require("typeorm");
const tenant_entity_1 = require("./tenant.entity");
const assistant_entity_1 = require("./assistant.entity");
const user_entity_1 = require("./user.entity");
const message_entity_1 = require("./message.entity");
let Conversation = class Conversation {
    id;
    tenantId;
    tenant;
    assistantId;
    assistant;
    userId;
    user;
    title;
    summary;
    totalTokensUsed;
    isActive;
    messages;
    createdAt;
};
exports.Conversation = Conversation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Conversation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Conversation.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tenantId' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], Conversation.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], Conversation.prototype, "assistantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => assistant_entity_1.Assistant, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'assistantId' }),
    __metadata("design:type", assistant_entity_1.Assistant)
], Conversation.prototype, "assistant", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], Conversation.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Conversation.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Conversation.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Conversation.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Conversation.prototype, "totalTokensUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Conversation.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, (message) => message.conversation),
    __metadata("design:type", Array)
], Conversation.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Conversation.prototype, "createdAt", void 0);
exports.Conversation = Conversation = __decorate([
    (0, typeorm_1.Entity)('conversations'),
    (0, typeorm_1.Index)(['tenantId', 'assistantId']),
    (0, typeorm_1.Index)(['tenantId', 'userId'])
], Conversation);
//# sourceMappingURL=conversation.entity.js.map