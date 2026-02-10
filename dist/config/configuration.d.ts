declare const _default: () => {
    port: number;
    nodeEnv: string;
    jwt: {
        secret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
    };
    redis: {
        host: string;
        port: number;
    };
    qdrant: {
        url: string;
        collectionName: string;
    };
    s3: {
        endpoint: string;
        accessKey: string;
        secretKey: string;
        bucket: string;
        region: string;
    };
    llm: {
        openaiApiKey: string | undefined;
        anthropicApiKey: string | undefined;
        defaultProvider: string;
        defaultModel: string;
        defaultEmbeddingModel: string;
    };
    rag: {
        chunkSize: number;
        chunkOverlap: number;
        topK: number;
    };
};
export default _default;
