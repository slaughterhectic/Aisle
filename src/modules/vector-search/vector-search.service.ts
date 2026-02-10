import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantService } from './qdrant.service';
import OpenAI from 'openai';

/**
 * Search result from vector database
 */
export interface SearchResult {
  documentId: string;
  chunkId: string;
  content: string;
  score: number;
}

/**
 * Vector Search Service
 * High-level semantic search operations.
 */
@Injectable()
export class VectorSearchService {
  private readonly logger = new Logger(VectorSearchService.name);
  private readonly openai: OpenAI;
  private readonly embeddingModel: string;

  constructor(
    private readonly qdrantService: QdrantService,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('llm.openaiApiKey'),
    });
    this.embeddingModel = this.configService.get<string>('llm.defaultEmbeddingModel') || 'text-embedding-3-small';
  }

  /**
   * Search for relevant document chunks
   * CRITICAL: Always filters by tenantId for data isolation
   */
  async search(
    tenantId: string,
    assistantId: string,
    query: string,
    topK: number = 5,
  ): Promise<SearchResult[]> {
    try {
      // Generate query embedding
      const queryEmbedding = await this.generateQueryEmbedding(query);

      // Search in Qdrant with tenant filter
      const results = await this.qdrantService.search(
        queryEmbedding,
        tenantId,
        assistantId,
        topK,
      );

      return results.map((r) => ({
        documentId: r.payload.documentId,
        chunkId: r.id,
        content: r.payload.content,
        score: r.score,
      }));
    } catch (error) {
      this.logger.error('Vector search failed', error);
      throw error;
    }
  }

  /**
   * Upsert vectors into the database
   */
  async upsertVectors(
    points: { id: string; vector: number[]; payload: any }[],
  ): Promise<void> {
    await this.qdrantService.upsert(points);
  }

  /**
   * Delete vectors for a document
   */
  async deleteDocumentVectors(documentId: string): Promise<void> {
    await this.qdrantService.deleteByDocumentId(documentId);
  }

  /**
   * Generate embedding for search query
   */
  private async generateQueryEmbedding(query: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: this.embeddingModel,
      input: query,
    });

    return response.data[0].embedding;
  }
}
