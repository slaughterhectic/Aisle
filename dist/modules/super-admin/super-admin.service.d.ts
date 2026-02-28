import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Tenant } from '../../database/entities/tenant.entity';
import { CreateTenantDto, CreateUserBySuperAdminDto } from './dto/super-admin.dto';
export declare class SuperAdminService {
    private readonly userRepository;
    private readonly tenantRepository;
    constructor(userRepository: Repository<User>, tenantRepository: Repository<Tenant>);
    createTenant(dto: CreateTenantDto): Promise<Tenant>;
    getAllTenants(): Promise<Tenant[]>;
    createUser(dto: CreateUserBySuperAdminDto): Promise<User>;
    getAllUsers(): Promise<User[]>;
}
