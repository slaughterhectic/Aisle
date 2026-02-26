import { UserRole } from '../../../common/interfaces/tenant-context.interface';
export declare class CreateTenantDto {
    name: string;
    slug: string;
}
export declare class CreateUserBySuperAdminDto {
    email: string;
    name: string;
    password: string;
    role: UserRole;
    tenantId?: string;
    newTenantName?: string;
    newTenantSlug?: string;
}
