import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO for document upload
 * File is handled separately via multipart/form-data
 */
export class UploadDocumentDto {
  @IsUUID()
  assistantId: string;
}

/**
 * Document response DTO
 */
export interface DocumentResponse {
  id: string;
  assistantId: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  status: string;
  chunkCount: number;
  characterCount: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export { UploadDocumentDto as UploadDto };
