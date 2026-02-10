import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

/**
 * Embedding Service
 * Generates vector embeddings using OpenAI's embedding model.
 */
@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly openai: OpenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('llm.openaiApiKey'),
    });
    this.model = this.configService.get<string>('llm.defaultEmbeddingModel') || 'text-embedding-3-small';
  }

  /**
   * Generate embeddings for multiple texts
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    try {
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: texts,
      });

      return response.data.map((item) => item.embedding);
    } catch (error) {
      this.logger.error('Failed to generate embeddings', error);
      throw error;
    }
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const embeddings = await this.generateEmbeddings([text]);
    return embeddings[0];
  }

  /**
   * Get embedding dimension (depends on model)
   */
  getEmbeddingDimension(): number {
    // text-embedding-3-small: 1536, text-embedding-ada-002: 1536
    return 1536;
  }
}
