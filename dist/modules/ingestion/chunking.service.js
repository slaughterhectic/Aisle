"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ChunkingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChunkingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ChunkingService = ChunkingService_1 = class ChunkingService {
    configService;
    logger = new common_1.Logger(ChunkingService_1.name);
    chunkSize;
    chunkOverlap;
    constructor(configService) {
        this.configService = configService;
        this.chunkSize = this.configService.get('rag.chunkSize') || 512;
        this.chunkOverlap = this.configService.get('rag.chunkOverlap') || 50;
    }
    chunkText(text) {
        const chunks = [];
        const cleanedText = text
            .replace(/\r\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        if (!cleanedText) {
            return [];
        }
        const sentences = this.splitIntoSentences(cleanedText);
        let currentChunk = '';
        let currentStartOffset = 0;
        let chunkIndex = 0;
        for (const sentence of sentences) {
            if (currentChunk.length + sentence.length > this.chunkSize * 4 && currentChunk) {
                chunks.push(this.createChunk(currentChunk, chunkIndex, currentStartOffset));
                const overlapStart = Math.max(0, currentChunk.length - this.chunkOverlap * 4);
                const overlap = currentChunk.substring(overlapStart);
                currentStartOffset = currentStartOffset + currentChunk.length - overlap.length;
                currentChunk = overlap + sentence;
                chunkIndex++;
            }
            else {
                currentChunk += sentence;
            }
        }
        if (currentChunk.trim()) {
            chunks.push(this.createChunk(currentChunk, chunkIndex, currentStartOffset));
        }
        this.logger.log(`Split text into ${chunks.length} chunks`);
        return chunks;
    }
    splitIntoSentences(text) {
        const sentences = [];
        const parts = text.split(/(?<=[.!?]\s)|(?<=\n\n)/);
        for (const part of parts) {
            if (part.trim()) {
                sentences.push(part);
            }
        }
        return sentences;
    }
    createChunk(content, index, startOffset) {
        return {
            content: content.trim(),
            index,
            startOffset,
            endOffset: startOffset + content.length,
            tokenCount: this.estimateTokens(content),
        };
    }
    estimateTokens(text) {
        return Math.ceil(text.length / 4);
    }
};
exports.ChunkingService = ChunkingService;
exports.ChunkingService = ChunkingService = ChunkingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ChunkingService);
//# sourceMappingURL=chunking.service.js.map