import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';

/**
 * Qdrant Service
 * Low-level wrapper for Qdrant vector database operations.
 */
@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly logger = new Logger(QdrantService.name);
  private readonly client: QdrantClient;
  private readonly collectionName: string;
  private readonly vectorSize = 1536; // OpenAI text-embedding-3-small dimension

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('qdrant.url') || 'http://localhost:6333';
    this.client = new QdrantClient({ url });
    this.collectionName = this.configService.get<string>('qdrant.collectionName') || 'documents';
  }

  /**
   * Initialize collection on module start
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.ensureCollectionExists();
    } catch (error) {
      this.logger.warn('Failed to initialize Qdrant collection. Will retry on first operation.', error);
    }
  }

  /**
   * Ensure the collection exists, create if not
   */
  async ensureCollectionExists(): Promise<void> {
    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some((c) => c.name === this.collectionName);

      if (!exists) {
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: this.vectorSize,
            distance: 'Cosine',
          },
        });

        // Create index on tenantId for filtered searches
        await this.client.createPayloadIndex(this.collectionName, {
          field_name: 'tenantId',
          field_schema: 'keyword',
        });

        // Create index on assistantId for scoped searches
        await this.client.createPayloadIndex(this.collectionName, {
          field_name: 'assistantId',
          field_schema: 'keyword',
        });

        this.logger.log(`Created Qdrant collection: ${this.collectionName}`);
      }
    } catch (error) {
      this.logger.error('Failed to ensure Qdrant collection exists', error);
      throw error;
    }
  }

  /**
   * Upsert vectors into the collection
   */
  async upsert(
    points: { id: string; vector: number[]; payload: Record<string, any> }[],
  ): Promise<void> {
    await this.ensureCollectionExists();

    await this.client.upsert(this.collectionName, {
      points: points.map((p) => ({
        id: p.id,
        vector: p.vector,
        payload: p.payload,
      })),
    });
  }

  /**
   * Search for similar vectors with tenant filtering
   */
  async search(
    vector: number[],
    tenantId: string,
    assistantId?: string,
    limit: number = 5,
    scoreThreshold: number = 0.7,
  ): Promise<{ id: string; score: number; payload: Record<string, any> }[]> {
    await this.ensureCollectionExists();

    const filter: any = {
      must: [{ key: 'tenantId', match: { value: tenantId } }],
    };

    if (assistantId) {
      filter.must.push({ key: 'assistantId', match: { value: assistantId } });
    }

    const results = await this.client.search(this.collectionName, {
      vector,
      limit,
      filter,
      score_threshold: scoreThreshold,
      with_payload: true,
    });

    return results.map((r) => ({
      id: r.id as string,
      score: r.score,
      payload: r.payload as Record<string, any>,
    }));
  }

  /**
   * Delete vectors by document ID
   */
  async deleteByDocumentId(documentId: string): Promise<void> {
    await this.client.delete(this.collectionName, {
      filter: {
        must: [{ key: 'documentId', match: { value: documentId } }],
      },
    });
  }

  /**
   * Delete vectors by tenant ID
   */
  async deleteByTenantId(tenantId: string): Promise<void> {
    await this.client.delete(this.collectionName, {
      filter: {
        must: [{ key: 'tenantId', match: { value: tenantId } }],
      },
    });
  }
}
