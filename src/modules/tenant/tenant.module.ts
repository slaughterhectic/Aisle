import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { Tenant } from '../../database/entities/tenant.entity';
import { KnowledgeModule } from '../knowledge/knowledge.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Tenant]),
        KnowledgeModule, // for StorageService
    ],
    controllers: [TenantController],
    providers: [TenantService],
    exports: [TenantService],
})
export class TenantModule { }
