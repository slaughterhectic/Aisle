import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';
import { StorageService } from './storage.service';
import { Document } from '../../database/entities/document.entity';
import { DocumentChunk } from '../../database/entities/document-chunk.entity';
import { IngestionModule } from '../ingestion/ingestion.module';

/**
 * Knowledge Base Module
 * Handles document upload, storage, and metadata management.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Document, DocumentChunk]),
    ConfigModule,
    forwardRef(() => IngestionModule),
  ],
  controllers: [KnowledgeController],
  providers: [KnowledgeService, StorageService],
  exports: [KnowledgeService, StorageService],
})
export class KnowledgeModule {}
