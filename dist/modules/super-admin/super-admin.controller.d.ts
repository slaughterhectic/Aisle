import { SuperAdminService } from './super-admin.service';
import { CreateTenantDto, CreateUserBySuperAdminDto } from './dto/super-admin.dto';
export declare class SuperAdminController {
    private readonly superAdminService;
    constructor(superAdminService: SuperAdminService);
    getAllTenants(): Promise<import("../../database/entities").Tenant[]>;
    createTenant(dto: CreateTenantDto): Promise<import("../../database/entities").Tenant>;
    getAllUsers(): Promise<import("../../database/entities").User[]>;
    createUser(dto: CreateUserBySuperAdminDto): Promise<import("../../database/entities").User>;
}
