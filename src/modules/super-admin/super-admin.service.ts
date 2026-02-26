import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../../database/entities/user.entity';
import { Tenant } from '../../database/entities/tenant.entity';
import { CreateTenantDto, CreateUserBySuperAdminDto } from './dto/super-admin.dto';

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async createTenant(dto: CreateTenantDto): Promise<Tenant> {
    const existing = await this.tenantRepository.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException('Tenant with this slug already exists');
    }

    const tenant = this.tenantRepository.create({
      name: dto.name,
      slug: dto.slug,
      settings: {},
      isActive: true,
    });
    return this.tenantRepository.save(tenant);
  }

  async getAllTenants(): Promise<Tenant[]> {
    return this.tenantRepository.find({ order: { createdAt: 'DESC' } });
  }

  async createUser(dto: CreateUserBySuperAdminDto): Promise<User> {
    let tenantId = dto.tenantId;

    if (!tenantId) {
      if (dto.newTenantName && dto.newTenantSlug) {
        const newTenant = await this.createTenant({
          name: dto.newTenantName,
          slug: dto.newTenantSlug,
        });
        tenantId = newTenant.id;
      } else {
        throw new BadRequestException('Provide either tenantId or newTenantName/Slug');
      }
    } else {
      const existingTenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
      if (!existingTenant) {
        throw new NotFoundException('Tenant not found');
      }
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email, tenantId },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists in the selected tenant');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = this.userRepository.create({
      tenantId,
      email: dto.email,
      name: dto.name,
      passwordHash,
      role: dto.role,
      isActive: true,
    });

    return this.userRepository.save(user);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['tenant'],
      order: { createdAt: 'DESC' },
    });
  }
}
