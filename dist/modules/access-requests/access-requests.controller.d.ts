import { AccessRequestsService } from './access-requests.service';
import { CreateAccessRequestDto, ApproveAccessRequestDto } from './dto/access-request.dto';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
export declare class AccessRequestsController {
    private readonly accessRequestsService;
    constructor(accessRequestsService: AccessRequestsService);
    requestAccess(dto: CreateAccessRequestDto): Promise<import("./dto/access-request.dto").AccessRequestResponse>;
    getPublicTenants(): Promise<{
        id: string;
        name: string;
    }[]>;
    getAdminRequests(tenant: TenantContext): Promise<import("./dto/access-request.dto").AccessRequestResponse[]>;
    adminApprove(tenant: TenantContext, id: string, dto: ApproveAccessRequestDto): Promise<{
        message: string;
    }>;
    adminReject(tenant: TenantContext, id: string): Promise<{
        message: string;
    }>;
    getSuperAdminRequests(): Promise<import("./dto/access-request.dto").AccessRequestResponse[]>;
    superAdminApprove(tenant: TenantContext, id: string, dto: ApproveAccessRequestDto): Promise<{
        message: string;
    }>;
    superAdminReject(tenant: TenantContext, id: string): Promise<{
        message: string;
    }>;
}
