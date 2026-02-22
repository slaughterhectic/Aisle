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
var ConversationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conversation_entity_1 = require("../../database/entities/conversation.entity");
const message_entity_1 = require("../../database/entities/message.entity");
const assistants_service_1 = require("../assistants/assistants.service");
const session_service_1 = require("./session.service");
let ConversationsService = ConversationsService_1 = class ConversationsService {
    conversationRepository;
    messageRepository;
    assistantsService;
    sessionService;
    logger = new common_1.Logger(ConversationsService_1.name);
    constructor(conversationRepository, messageRepository, assistantsService, sessionService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.assistantsService = assistantsService;
        this.sessionService = sessionService;
    }
    async create(tenant, dto) {
        const assistant = await this.assistantsService.findOneEntity(tenant.tenantId, dto.assistantId);
        const conversation = this.conversationRepository.create({
            tenantId: tenant.tenantId,
            assistantId: dto.assistantId,
            userId: tenant.userId,
            title: dto.title,
        });
        const saved = await this.conversationRepository.save(conversation);
        const sessionState = {
            conversationId: saved.id,
            tenantId: tenant.tenantId,
            assistantId: dto.assistantId,
            userId: tenant.userId,
            recentMessages: [],
            lastActivity: Date.now(),
        };
        await this.sessionService.createSession(sessionState);
        return this.toConversationResponse(saved, assistant.name);
    }
    async findAll(tenant) {
        const conversations = await this.conversationRepository.find({
            where: { tenantId: tenant.tenantId, userId: tenant.userId },
            relations: ['assistant'],
            order: { createdAt: 'DESC' },
        });
        return conversations.map((c) => this.toConversationResponse(c, c.assistant?.name || 'Unknown'));
    }
    async findOne(tenant, id) {
        const conversation = await this.conversationRepository.findOne({
            where: { id, tenantId: tenant.tenantId },
            relations: ['assistant'],
        });
        if (!conversation) {
            throw new common_1.NotFoundException(`Conversation with ID "${id}" not found`);
        }
        return conversation;
    }
    async update(tenant, id, title) {
        const conversation = await this.findOne(tenant, id);
        if (title !== undefined) {
            conversation.title = title;
            await this.conversationRepository.save(conversation);
        }
        return this.toConversationResponse(conversation, conversation.assistant?.name || 'Unknown');
    }
    async delete(tenant, id) {
        const conversation = await this.findOne(tenant, id);
        await this.sessionService.deleteSession(id).catch((err) => {
            this.logger.warn(`Failed to clear session for deleted conversation ${id}`);
        });
        await this.conversationRepository.remove(conversation);
    }
    async togglePin(tenant, id) {
        const conversation = await this.findOne(tenant, id);
        conversation.isPinned = !conversation.isPinned;
        await this.conversationRepository.save(conversation);
        return this.toConversationResponse(conversation, conversation.assistant?.name || 'Unknown');
    }
    async toggleArchive(tenant, id) {
        const conversation = await this.findOne(tenant, id);
        conversation.isArchived = !conversation.isArchived;
        if (conversation.isArchived) {
            conversation.isPinned = false;
        }
        await this.conversationRepository.save(conversation);
        return this.toConversationResponse(conversation, conversation.assistant?.name || 'Unknown');
    }
    async getMessages(tenant, conversationId) {
        await this.findOne(tenant, conversationId);
        const messages = await this.messageRepository.find({
            where: { tenantId: tenant.tenantId, conversationId },
            order: { createdAt: 'ASC' },
        });
        return messages.map((m) => this.toMessageResponse(m));
    }
    async saveMessage(tenantId, conversationId, role, content, tokensUsed = 0, model, contextChunks) {
        const message = this.messageRepository.create({
            tenantId,
            conversationId,
            role,
            content,
            tokensUsed,
            model,
            contextChunks,
        });
        return this.messageRepository.save(message);
    }
    async updateTokenCount(conversationId, tokensUsed) {
        await this.conversationRepository.increment({ id: conversationId }, 'totalTokensUsed', tokensUsed);
    }
    async getRecentMessages(conversationId, limit = 10) {
        return this.messageRepository.find({
            where: { conversationId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    toConversationResponse(conversation, assistantName) {
        return {
            id: conversation.id,
            assistantId: conversation.assistantId,
            assistantName,
            userId: conversation.userId,
            title: conversation.title,
            totalTokensUsed: conversation.totalTokensUsed,
            isPinned: conversation.isPinned ?? false,
            isArchived: conversation.isArchived ?? false,
            createdAt: conversation.createdAt,
        };
    }
    toMessageResponse(message) {
        return {
            id: message.id,
            role: message.role,
            content: message.content,
            tokensUsed: message.tokensUsed,
            model: message.model,
            createdAt: message.createdAt,
        };
    }
};
exports.ConversationsService = ConversationsService;
exports.ConversationsService = ConversationsService = ConversationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        assistants_service_1.AssistantsService,
        session_service_1.SessionService])
], ConversationsService);
//# sourceMappingURL=conversations.service.js.map