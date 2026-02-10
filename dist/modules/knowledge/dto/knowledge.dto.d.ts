export declare class UploadDocumentDto {
    assistantId: string;
}
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
