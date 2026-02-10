import { Tenant } from './tenant.entity';
import { UserRole } from '../../common/interfaces/tenant-context.interface';
export declare class User {
    id: string;
    tenantId: string;
    tenant: Tenant;
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    lastLoginAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
