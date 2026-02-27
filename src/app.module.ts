import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

// Configuration
import configuration from './config/configuration';

// Common
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

// Entities
import { Tenant } from './database/entities/tenant.entity';
import { User } from './database/entities/user.entity';
import { Assistant } from './database/entities/assistant.entity';
import { Conversation } from './database/entities/conversation.entity';
import { Message } from './database/entities/message.entity';
import { Document } from './database/entities/document.entity';
import { DocumentChunk } from './database/entities/document-chunk.entity';
import { UsageLog } from './database/entities/usage-log.entity';
import { AccessRequest } from './database/entities/access-request.entity';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { AssistantsModule } from './modules/assistants/assistants.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { VectorSearchModule } from './modules/vector-search/vector-search.module';
import { LlmGatewayModule } from './modules/llm-gateway/llm-gateway.module';
import { UsageModule } from './modules/usage/usage.module';
import { HealthController } from './health.controller';
import { SuperAdminModule } from './modules/super-admin/super-admin.module';
import { AccessRequestsModule } from './modules/access-requests/access-requests.module';

/**
 * Root Application Module
 * 
 * This is the main module that ties together all the feature modules.
 * The application follows a modular monolith architecture for easy
 * future evolution into microservices.
 */
@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Database - PostgreSQL with TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        entities: [
          Tenant,
          User,
          Assistant,
          Conversation,
          Message,
          Document,
          DocumentChunk,
          UsageLog,
          AccessRequest,
        ],
        synchronize: configService.get<string>('nodeEnv') !== 'production', // Auto-sync in dev only
        logging: configService.get<string>('nodeEnv') === 'development',
      }),
      inject: [ConfigService],
    }),

    // JWT for global guard
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret') || 'default-secret',
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn') || '1d',
        },
      } as any),
      inject: [ConfigService],
    }),

    // Feature Modules
    AuthModule,
    AssistantsModule,
    ConversationsModule,
    KnowledgeModule,
    IngestionModule,
    VectorSearchModule,
    LlmGatewayModule,
    UsageModule,
    SuperAdminModule,
    AccessRequestsModule,
  ],
  controllers: [HealthController],
  providers: [
    // Global JWT Authentication Guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Roles Guard (RBAC)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
