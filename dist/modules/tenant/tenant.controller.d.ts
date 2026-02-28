import { Response } from 'express';
import { TenantService } from './tenant.service';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
export declare class TenantController {
    private readonly tenantService;
    constructor(tenantService: TenantService);
    getTenantInfo(tenant: TenantContext): Promise<{
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
    getLogo(tenantId: string, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
