"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const configuration_1 = __importDefault(require("./config/configuration"));
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const tenant_entity_1 = require("./database/entities/tenant.entity");
const user_entity_1 = require("./database/entities/user.entity");
const assistant_entity_1 = require("./database/entities/assistant.entity");
const conversation_entity_1 = require("./database/entities/conversation.entity");
const message_entity_1 = require("./database/entities/message.entity");
const document_entity_1 = require("./database/entities/document.entity");
const document_chunk_entity_1 = require("./database/entities/document-chunk.entity");
const usage_log_entity_1 = require("./database/entities/usage-log.entity");
const access_request_entity_1 = require("./database/entities/access-request.entity");
const auth_module_1 = require("./modules/auth/auth.module");
const assistants_module_1 = require("./modules/assistants/assistants.module");
const conversations_module_1 = require("./modules/conversations/conversations.module");
const knowledge_module_1 = require("./modules/knowledge/knowledge.module");
const ingestion_module_1 = require("./modules/ingestion/ingestion.module");
const vector_search_module_1 = require("./modules/vector-search/vector-search.module");
const llm_gateway_module_1 = require("./modules/llm-gateway/llm-gateway.module");
const usage_module_1 = require("./modules/usage/usage.module");
const health_controller_1 = require("./health.controller");
const super_admin_module_1 = require("./modules/super-admin/super-admin.module");
const access_requests_module_1 = require("./modules/access-requests/access-requests.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('database.host'),
                    port: configService.get('database.port'),
                    username: configService.get('database.username'),
                    password: configService.get('database.password'),
                    database: configService.get('database.name'),
                    entities: [
                        tenant_entity_1.Tenant,
                        user_entity_1.User,
                        assistant_entity_1.Assistant,
                        conversation_entity_1.Conversation,
                        message_entity_1.Message,
                        document_entity_1.Document,
                        document_chunk_entity_1.DocumentChunk,
                        usage_log_entity_1.UsageLog,
                        access_request_entity_1.AccessRequest,
                    ],
                    synchronize: configService.get('nodeEnv') !== 'production',
                    logging: configService.get('nodeEnv') === 'development',
                }),
                inject: [config_1.ConfigService],
            }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    secret: configService.get('jwt.secret') || 'default-secret',
                    signOptions: {
                        expiresIn: configService.get('jwt.expiresIn') || '1d',
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            assistants_module_1.AssistantsModule,
            conversations_module_1.ConversationsModule,
            knowledge_module_1.KnowledgeModule,
            ingestion_module_1.IngestionModule,
            vector_search_module_1.VectorSearchModule,
            llm_gateway_module_1.LlmGatewayModule,
            usage_module_1.UsageModule,
            super_admin_module_1.SuperAdminModule,
            access_requests_module_1.AccessRequestsModule,
        ],
        controllers: [health_controller_1.HealthController],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: http_exception_filter_1.GlobalExceptionFilter,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map