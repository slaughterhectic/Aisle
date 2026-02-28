import { Repository } from 'typeorm';
import { Tenant } from '../../database/entities/tenant.entity';
import { StorageService } from '../knowledge/storage.service';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
import { Readable } from 'stream';
export declare class TenantService {
    private readonly tenantRepo;
    private readonly storageService;
    private readonly logger;
    constructor(tenantRepo: Repository<Tenant>, storageService: StorageService);
    getTenantInfo(tenantId: string): Promise<{
        id: string;
        name: string;
        slug: string;
        logoUrl: string | null;
        createdAt: Date;
    }>;
    uploadLogo(tenant: TenantContext, file: Express.Multer.File): Promise<{
        logoUrl: string;
        message: string;
    }>;
    getLogoStream(tenantId: string): Promise<{
        stream: Readable;
        mimeType: string;
    } | null>;
}
