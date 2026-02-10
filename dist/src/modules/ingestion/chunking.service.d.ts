import { ConfigService } from '@nestjs/config';
export interface TextChunk {
    content: string;
    index: number;
    startOffset: number;
    endOffset: number;
    tokenCount: number;
}
export declare class ChunkingService {
    private readonly configService;
    private readonly logger;
    private readonly chunkSize;
    private readonly chunkOverlap;
    constructor(configService: ConfigService);
    chunkText(text: string): TextChunk[];
    private splitIntoSentences;
    private createChunk;
    private estimateTokens;
}
