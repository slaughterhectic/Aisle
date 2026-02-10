"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const ingestion_service_1 = require("./ingestion.service");
const extraction_service_1 = require("./extraction.service");
const chunking_service_1 = require("./chunking.service");
const embedding_service_1 = require("./embedding.service");
const document_entity_1 = require("../../database/entities/document.entity");
const document_chunk_entity_1 = require("../../database/entities/document-chunk.entity");
const knowledge_module_1 = require("../knowledge/knowledge.module");
const vector_search_module_1 = require("../vector-search/vector-search.module");
let IngestionModule = class IngestionModule {
};
exports.IngestionModule = IngestionModule;
exports.IngestionModule = IngestionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([document_entity_1.Document, document_chunk_entity_1.DocumentChunk]),
            config_1.ConfigModule,
            (0, common_1.forwardRef)(() => knowledge_module_1.KnowledgeModule),
            vector_search_module_1.VectorSearchModule,
        ],
        providers: [ingestion_service_1.IngestionService, extraction_service_1.ExtractionService, chunking_service_1.ChunkingService, embedding_service_1.EmbeddingService],
        exports: [ingestion_service_1.IngestionService],
    })
], IngestionModule);
//# sourceMappingURL=ingestion.module.js.map