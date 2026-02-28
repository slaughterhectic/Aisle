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
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
let StorageService = StorageService_1 = class StorageService {
    configService;
    logger = new common_1.Logger(StorageService_1.name);
    s3Client;
    bucket;
    constructor(configService) {
        this.configService = configService;
        this.s3Client = new client_s3_1.S3Client({
            endpoint: this.configService.get('s3.endpoint'),
            region: this.configService.get('s3.region'),
            credentials: {
                accessKeyId: this.configService.get('s3.accessKey') || '',
                secretAccessKey: this.configService.get('s3.secretKey') || '',
            },
            forcePathStyle: true,
        });
        this.bucket = this.configService.get('s3.bucket') || 'aisle-documents';
    }
    generateKey(tenantId, filename) {
        const timestamp = Date.now();
        const uuid = (0, uuid_1.v4)().substring(0, 8);
        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        return `${tenantId}/${timestamp}-${uuid}-${sanitizedFilename}`;
    }
    async uploadFile(key, buffer, mimeType) {
        try {
            await this.s3Client.send(new client_s3_1.PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: buffer,
                ContentType: mimeType,
            }));
            this.logger.log(`Uploaded file: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to upload file: ${key}`, error);
            throw error;
        }
    }
    async downloadFile(key) {
        try {
            const response = await this.s3Client.send(new client_s3_1.GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            }));
            const stream = response.Body;
            const chunks = [];
            return new Promise((resolve, reject) => {
                stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
                stream.on('error', reject);
                stream.on('end', () => resolve(Buffer.concat(chunks)));
            });
        }
        catch (error) {
            this.logger.error(`Failed to download file: ${key}`, error);
            throw error;
        }
    }
    async getFileStream(key) {
        try {
            const response = await this.s3Client.send(new client_s3_1.GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            }));
            return response.Body;
        }
        catch (error) {
            this.logger.error(`Failed to get file stream: ${key}`, error);
            throw error;
        }
    }
    async deleteFile(key) {
        try {
            await this.s3Client.send(new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            }));
            this.logger.log(`Deleted file: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete file: ${key}`, error);
            throw error;
        }
    }
    async fileExists(key) {
        try {
            await this.s3Client.send(new client_s3_1.HeadObjectCommand({
                Bucket: this.bucket,
                Key: key,
            }));
            return true;
        }
        catch (error) {
            return false;
        }
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map