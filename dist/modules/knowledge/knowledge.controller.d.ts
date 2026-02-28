import { Response } from 'express';
import { KnowledgeService } from './knowledge.service';
import { UploadDocumentDto, DocumentResponse } from './dto/knowledge.dto';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
export declare class KnowledgeController {
    private readonly knowledgeService;
    constructor(knowledgeService: KnowledgeService);
    upload(tenant: TenantContext, dto: UploadDocumentDto, file: Express.Multer.File): Promise<DocumentResponse>;
    findAll(tenant: TenantContext, assistantId?: string): Promise<DocumentResponse[]>;
    findOne(tenant: TenantContext, id: string): Promise<DocumentResponse>;
    getContent(tenant: TenantContext, id: string, download: boolean, res: Response): Promise<void>;
    remove(tenant: TenantContext, id: string): Promise<void>;
}
