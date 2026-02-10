import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Text chunk with metadata
 */
export interface TextChunk {
  content: string;
  index: number;
  startOffset: number;
  endOffset: number;
  tokenCount: number;
}

/**
 * Chunking Service
 * Splits text into overlapping chunks for embedding.
 */
@Injectable()
export class ChunkingService {
  private readonly logger = new Logger(ChunkingService.name);
  private readonly chunkSize: number;
  private readonly chunkOverlap: number;

  constructor(private readonly configService: ConfigService) {
    this.chunkSize = this.configService.get<number>('rag.chunkSize') || 512;
    this.chunkOverlap = this.configService.get<number>('rag.chunkOverlap') || 50;
  }

  /**
   * Split text into chunks
   * Uses sentence-aware splitting with character-based fallback
   */
  chunkText(text: string): TextChunk[] {
    const chunks: TextChunk[] = [];
    
    // Clean and normalize text
    const cleanedText = text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!cleanedText) {
      return [];
    }

    // Split into sentences for better chunk boundaries
    const sentences = this.splitIntoSentences(cleanedText);
    
    let currentChunk = '';
    let currentStartOffset = 0;
    let chunkIndex = 0;

    for (const sentence of sentences) {
      // If adding this sentence exceeds chunk size, finalize current chunk
      if (currentChunk.length + sentence.length > this.chunkSize * 4 && currentChunk) {
        chunks.push(this.createChunk(currentChunk, chunkIndex, currentStartOffset));
        
        // Start new chunk with overlap
        const overlapStart = Math.max(0, currentChunk.length - this.chunkOverlap * 4);
        const overlap = currentChunk.substring(overlapStart);
        currentStartOffset = currentStartOffset + currentChunk.length - overlap.length;
        currentChunk = overlap + sentence;
        chunkIndex++;
      } else {
        currentChunk += sentence;
      }
    }

    // Add the last chunk
    if (currentChunk.trim()) {
      chunks.push(this.createChunk(currentChunk, chunkIndex, currentStartOffset));
    }

    this.logger.log(`Split text into ${chunks.length} chunks`);
    return chunks;
  }

  /**
   * Split text into sentences
   */
  private splitIntoSentences(text: string): string[] {
    // Simple sentence splitting on common delimiters
    const sentences: string[] = [];
    const parts = text.split(/(?<=[.!?]\s)|(?<=\n\n)/);
    
    for (const part of parts) {
      if (part.trim()) {
        sentences.push(part);
      }
    }
    
    return sentences;
  }

  /**
   * Create a chunk object
   */
  private createChunk(content: string, index: number, startOffset: number): TextChunk {
    return {
      content: content.trim(),
      index,
      startOffset,
      endOffset: startOffset + content.length,
      tokenCount: this.estimateTokens(content),
    };
  }

  /**
   * Estimate token count (rough approximation: 1 token ≈ 4 chars)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
