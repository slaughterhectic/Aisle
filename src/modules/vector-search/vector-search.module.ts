import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VectorSearchService } from './vector-search.service';
import { QdrantService } from './qdrant.service';

/**
 * Vector Search Module
 * Handles semantic search using Qdrant vector database.
 */
@Module({
  imports: [ConfigModule],
  providers: [VectorSearchService, QdrantService],
  exports: [VectorSearchService, QdrantService],
})
export class VectorSearchModule {}
