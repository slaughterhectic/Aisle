import { Repository } from 'typeorm';
import { AccessRequest } from '../../database/entities/access-request.entity';
import { User } from '../../database/entities/user.entity';
import { Tenant } from '../../database/entities/tenant.entity';
import { UserRole } from '../../common/interfaces/tenant-context.interface';
import { CreateAccessRequestDto, ApproveAccessRequestDto, AccessRequestResponse } from './dto/access-request.dto';
export declare class AccessRequestsService {
    private readonly accessRequestRepo;
    private readonly userRepo;
    private readonly tenantRepo;
    private readonly logger;
    constructor(accessRequestRepo: Repository<AccessRequest>, userRepo: Repository<User>, tenantRepo: Repository<Tenant>);
    create(dto: CreateAccessRequestDto): Promise<AccessRequestResponse>;
    findPendingForTenant(tenantId: string): Promise<AccessRequestResponse[]>;
    findAllPending(): Promise<AccessRequestResponse[]>;
    approve(requestId: string, reviewerId: string, reviewerRole: UserRole, reviewerTenantId: string, dto?: ApproveAccessRequestDto): Promise<{
        message: string;
    }>;
    reject(requestId: string, reviewerId: string, reviewerRole: UserRole, reviewerTenantId: string): Promise<{
        message: string;
    }>;
    getPublicTenants(): Promise<{
        id: string;
        name: string;
    }[]>;
    private toResponse;
    private generateSlug;
    private generateTempPassword;
}
