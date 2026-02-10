"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwt: {
        secret: process.env.JWT_SECRET || 'change-me-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    database: {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        username: process.env.DATABASE_USERNAME || 'aisle',
        password: process.env.DATABASE_PASSWORD || 'aisle_secret',
        name: process.env.DATABASE_NAME || 'aisle_db',
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
    qdrant: {
        url: process.env.QDRANT_URL || 'http://localhost:6333',
        collectionName: process.env.QDRANT_COLLECTION_NAME || 'documents',
    },
    s3: {
        endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
        accessKey: process.env.S3_ACCESS_KEY || 'minio_admin',
        secretKey: process.env.S3_SECRET_KEY || 'minio_secret',
        bucket: process.env.S3_BUCKET || 'aisle-documents',
        region: process.env.S3_REGION || 'us-east-1',
    },
    llm: {
        openaiApiKey: process.env.OPENAI_API_KEY,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        defaultProvider: process.env.DEFAULT_LLM_PROVIDER || 'openai',
        defaultModel: process.env.DEFAULT_LLM_MODEL || 'gpt-4o-mini',
        defaultEmbeddingModel: process.env.DEFAULT_EMBEDDING_MODEL || 'text-embedding-3-small',
    },
    rag: {
        chunkSize: parseInt(process.env.RAG_CHUNK_SIZE || '512', 10),
        chunkOverlap: parseInt(process.env.RAG_CHUNK_OVERLAP || '50', 10),
        topK: parseInt(process.env.RAG_TOP_K || '5', 10),
    },
});
//# sourceMappingURL=configuration.js.map