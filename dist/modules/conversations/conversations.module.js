"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const conversations_controller_1 = require("./conversations.controller");
const conversations_service_1 = require("./conversations.service");
const chat_service_1 = require("./chat.service");
const session_service_1 = require("./session.service");
const conversation_entity_1 = require("../../database/entities/conversation.entity");
const message_entity_1 = require("../../database/entities/message.entity");
const assistants_module_1 = require("../assistants/assistants.module");
const vector_search_module_1 = require("../vector-search/vector-search.module");
const llm_gateway_module_1 = require("../llm-gateway/llm-gateway.module");
const usage_module_1 = require("../usage/usage.module");
let ConversationsModule = class ConversationsModule {
};
exports.ConversationsModule = ConversationsModule;
exports.ConversationsModule = ConversationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([conversation_entity_1.Conversation, message_entity_1.Message]),
            assistants_module_1.AssistantsModule,
            vector_search_module_1.VectorSearchModule,
            llm_gateway_module_1.LlmGatewayModule,
            usage_module_1.UsageModule,
        ],
        controllers: [conversations_controller_1.ConversationsController],
        providers: [conversations_service_1.ConversationsService, chat_service_1.ChatService, session_service_1.SessionService],
        exports: [conversations_service_1.ConversationsService, chat_service_1.ChatService, session_service_1.SessionService],
    })
], ConversationsModule);
//# sourceMappingURL=conversations.module.js.map