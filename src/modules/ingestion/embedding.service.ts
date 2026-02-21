import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

/**
 * Embedding Service
 * Generates vector embeddings using the configured provider.
 * Prefers OpenRouter when set as default provider, falls back to OpenAI.
 */
@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const defaultProvider = this.configService.get<string>('llm.defaultProvider') || 'openai';
    const openrouterKey = this.configService.get<string>('llm.openrouterApiKey');
    const openaiKey = this.configService.get<string>('llm.openaiApiKey');

    // Use OpenRouter for embeddings when it's the default provider
    if (defaultProvider === 'openrouter' && openrouterKey && openrouterKey !== 'your-openrouter-api-key') {
      this.client = new OpenAI({
        apiKey: openrouterKey,
        baseURL: 'https://openrouter.ai/api/v1',
      });
      this.model = 'openai/text-embedding-3-small';
      this.logger.log('EmbeddingService using OpenRouter');
    } else if (openaiKey && openaiKey !== 'your-openai-api-key') {
      this.client = new OpenAI({ apiKey: openaiKey });
      this.model = this.configService.get<string>('llm.defaultEmbeddingModel') || 'text-embedding-3-small';
      this.logger.log('EmbeddingService using OpenAI');
    } else {
      this.client = new OpenAI({ apiKey: 'missing' });
      this.model = 'text-embedding-3-small';
      this.logger.warn('EmbeddingService: No valid API key found.');
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    try {
      const response = await this.client.embeddings.create({ model: this.model, input: texts });
      return response.data.map((item) => item.embedding);
    } catch (error) {
      this.logger.error('Failed to generate embeddings', error);
      throw error;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const embeddings = await this.generateEmbeddings([text]);
    return embeddings[0];
  }

  getEmbeddingDimension(): number {
    return 1536;
  }
}
