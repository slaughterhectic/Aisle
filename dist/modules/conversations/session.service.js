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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SessionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let SessionService = SessionService_1 = class SessionService {
    configService;
    logger = new common_1.Logger(SessionService_1.name);
    redis;
    sessionTtl = 3600;
    maxRecentMessages = 10;
    constructor(configService) {
        this.configService = configService;
        this.redis = new ioredis_1.default({
            host: this.configService.get('redis.host'),
            port: this.configService.get('redis.port'),
        });
        this.redis.on('error', (err) => {
            this.logger.error('Redis connection error', err);
        });
    }
    getSessionKey(conversationId) {
        return `session:${conversationId}`;
    }
    async getSession(conversationId) {
        const key = this.getSessionKey(conversationId);
        const data = await this.redis.get(key);
        if (!data) {
            return null;
        }
        try {
            return JSON.parse(data);
        }
        catch (error) {
            this.logger.warn(`Failed to parse session data for ${conversationId}`);
            return null;
        }
    }
    async createSession(session) {
        const key = this.getSessionKey(session.conversationId);
        await this.redis.setex(key, this.sessionTtl, JSON.stringify(session));
    }
    async addMessage(conversationId, message) {
        const session = await this.getSession(conversationId);
        if (!session) {
            this.logger.warn(`Session not found for ${conversationId}`);
            return;
        }
        session.recentMessages.push(message);
        if (session.recentMessages.length > this.maxRecentMessages) {
            session.recentMessages = session.recentMessages.slice(-this.maxRecentMessages);
        }
        session.lastActivity = Date.now();
        const key = this.getSessionKey(conversationId);
        await this.redis.setex(key, this.sessionTtl, JSON.stringify(session));
    }
    async updateSummary(conversationId, summary) {
        const session = await this.getSession(conversationId);
        if (!session) {
            return;
        }
        session.summary = summary;
        session.lastActivity = Date.now();
        const key = this.getSessionKey(conversationId);
        await this.redis.setex(key, this.sessionTtl, JSON.stringify(session));
    }
    async deleteSession(conversationId) {
        const key = this.getSessionKey(conversationId);
        await this.redis.del(key);
    }
    async refreshSession(conversationId) {
        const key = this.getSessionKey(conversationId);
        await this.redis.expire(key, this.sessionTtl);
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = SessionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SessionService);
//# sourceMappingURL=session.service.js.map