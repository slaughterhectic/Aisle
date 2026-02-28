import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
export declare class StorageService {
    private readonly configService;
    private readonly logger;
    private readonly s3Client;
    private readonly bucket;
    constructor(configService: ConfigService);
    generateKey(tenantId: string, filename: string): string;
    uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<void>;
    downloadFile(key: string): Promise<Buffer>;
    getFileStream(key: string): Promise<Readable>;
    deleteFile(key: string): Promise<void>;
    fileExists(key: string): Promise<boolean>;
}
