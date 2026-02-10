import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

/**
 * Storage Service
 * Handles S3-compatible object storage operations (MinIO in dev).
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      endpoint: this.configService.get<string>('s3.endpoint'),
      region: this.configService.get<string>('s3.region'),
      credentials: {
        accessKeyId: this.configService.get<string>('s3.accessKey') || '',
        secretAccessKey: this.configService.get<string>('s3.secretKey') || '',
      },
      forcePathStyle: true, // Required for MinIO
    });
    this.bucket = this.configService.get<string>('s3.bucket') || 'aisle-documents';
  }

  /**
   * Generate S3 key for a document
   */
  generateKey(tenantId: string, filename: string): string {
    const timestamp = Date.now();
    const uuid = uuidv4().substring(0, 8);
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${tenantId}/${timestamp}-${uuid}-${sanitizedFilename}`;
  }

  /**
   * Upload file to S3
   */
  async uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<void> {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        }),
      );
      this.logger.log(`Uploaded file: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to upload file: ${key}`, error);
      throw error;
    }
  }

  /**
   * Download file from S3
   */
  async downloadFile(key: string): Promise<Buffer> {
    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      const stream = response.Body as Readable;
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });
    } catch (error) {
      this.logger.error(`Failed to download file: ${key}`, error);
      throw error;
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      this.logger.log(`Deleted file: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${key}`, error);
      throw error;
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch (error) {
      return false;
    }
  }
}
