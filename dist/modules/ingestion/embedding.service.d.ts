import { ConfigService } from '@nestjs/config';
export declare class EmbeddingService {
    private readonly configService;
    private readonly logger;
    private readonly openai;
    private readonly model;
    constructor(configService: ConfigService);
    generateEmbeddings(texts: string[]): Promise<number[][]>;
    generateEmbedding(text: string): Promise<number[]>;
    getEmbeddingDimension(): number;
}
