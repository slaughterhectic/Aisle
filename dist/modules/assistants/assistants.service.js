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
exports.AssistantsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const assistant_entity_1 = require("../../database/entities/assistant.entity");
let AssistantsService = class AssistantsService {
    assistantRepository;
    constructor(assistantRepository) {
        this.assistantRepository = assistantRepository;
    }
    async create(tenant, dto) {
        const assistant = this.assistantRepository.create({
            ...dto,
            tenantId: tenant.tenantId,
        });
        const saved = await this.assistantRepository.save(assistant);
        return this.toResponse(saved);
    }
    async findAll(tenant) {
        const assistants = await this.assistantRepository.find({
            where: { tenantId: tenant.tenantId },
            order: { createdAt: 'DESC' },
        });
        return assistants.map((a) => this.toResponse(a));
    }
    async findOne(tenant, id) {
        const assistant = await this.assistantRepository.findOne({
            where: { id, tenantId: tenant.tenantId },
        });
        if (!assistant) {
            throw new common_1.NotFoundException(`Assistant with ID "${id}" not found`);
        }
        return this.toResponse(assistant);
    }
    async findOneEntity(tenantId, id) {
        const assistant = await this.assistantRepository.findOne({
            where: { id, tenantId },
        });
        if (!assistant) {
            throw new common_1.NotFoundException(`Assistant with ID "${id}" not found`);
        }
        return assistant;
    }
    async update(tenant, id, dto) {
        const assistant = await this.findOneEntity(tenant.tenantId, id);
        Object.assign(assistant, dto);
        const saved = await this.assistantRepository.save(assistant);
        return this.toResponse(saved);
    }
    async remove(tenant, id) {
        const assistant = await this.findOneEntity(tenant.tenantId, id);
        await this.assistantRepository.remove(assistant);
    }
    toResponse(assistant) {
        return {
            id: assistant.id,
            name: assistant.name,
            description: assistant.description,
            systemPrompt: assistant.systemPrompt,
            provider: assistant.provider,
            model: assistant.model,
            temperature: Number(assistant.temperature),
            maxTokens: assistant.maxTokens,
            ragEnabled: assistant.ragEnabled,
            ragTopK: assistant.ragTopK,
            isActive: assistant.isActive,
            createdAt: assistant.createdAt,
            updatedAt: assistant.updatedAt,
        };
    }
};
exports.AssistantsService = AssistantsService;
exports.AssistantsService = AssistantsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(assistant_entity_1.Assistant)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AssistantsService);
//# sourceMappingURL=assistants.service.js.map