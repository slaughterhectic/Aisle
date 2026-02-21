import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantService } from './qdrant.service';
import OpenAI from 'openai';

export interface SearchResult {
  documentId: string;
  chunkId: string;
  content: string;
  score: number;
}

@Injectable()
export class VectorSearchService {
  private readonly logger = new Logger(VectorSearchService.name);
  private readonly embeddingClient: OpenAI;
  private readonly embeddingModel: string;

  constructor(
    private readonly qdrantService: QdrantService,
    private readonly configService: ConfigService,
  ) {
    const defaultProvider = this.configService.get<string>('llm.defaultProvider') || 'openai';
    const openrouterKey = this.configService.get<string>('llm.openrouterApiKey');
    const openaiKey = this.configService.get<string>('llm.openaiApiKey');

    if (defaultProvider === 'openrouter' && openrouterKey && openrouterKey !== 'your-openrouter-api-key') {
      this.embeddingClient = new OpenAI({
        apiKey: openrouterKey,
        baseURL: 'https://openrouter.ai/api/v1',
      });
      this.embeddingModel = 'openai/text-embedding-3-small';
    } else if (openaiKey && openaiKey !== 'your-openai-api-key') {
      this.embeddingClient = new OpenAI({ apiKey: openaiKey });
      this.embeddingModel = this.configService.get<string>('llm.defaultEmbeddingModel') || 'text-embedding-3-small';
    } else {
      this.embeddingClient = new OpenAI({ apiKey: 'missing' });
      this.embeddingModel = 'text-embedding-3-small';
    }
  }

  async search(tenantId: string, assistantId: string, query: string, topK: number = 5): Promise<SearchResult[]> {
    try {
      const queryEmbedding = await this.generateQueryEmbedding(query);
      const results = await this.qdrantService.search(queryEmbedding, tenantId, assistantId, topK);
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

  async upsertVectors(points: { id: string; vector: number[]; payload: any }[]): Promise<void> {
    await this.qdrantService.upsert(points);
  }

  async deleteDocumentVectors(documentId: string): Promise<void> {
    await this.qdrantService.deleteByDocumentId(documentId);
  }

  private async generateQueryEmbedding(query: string): Promise<number[]> {
    const response = await this.embeddingClient.embeddings.create({
      model: this.embeddingModel,
      input: query,
    });
    return response.data[0].embedding;
  }
}
