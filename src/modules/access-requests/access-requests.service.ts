import { Injectable, Logger, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { AccessRequest, AccessRequestStatus } from '../../database/entities/access-request.entity';
import { User } from '../../database/entities/user.entity';
import { Tenant } from '../../database/entities/tenant.entity';
import { UserRole, TenantContext } from '../../common/interfaces/tenant-context.interface';
import { CreateAccessRequestDto, ApproveAccessRequestDto, AccessRequestResponse } from './dto/access-request.dto';

@Injectable()
export class AccessRequestsService {
  private readonly logger = new Logger(AccessRequestsService.name);

  constructor(
    @InjectRepository(AccessRequest)
    private readonly accessRequestRepo: Repository<AccessRequest>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) { }

  /**
   * Submit a new access request (public, no auth)
   */
  async create(dto: CreateAccessRequestDto): Promise<AccessRequestResponse> {
    // Validate tenant if specified
    if (dto.tenantId) {
      const tenant = await this.tenantRepo.findOne({ where: { id: dto.tenantId } });
      if (!tenant) {
        throw new NotFoundException('The selected organization was not found');
      }
    }

    // Check for duplicate pending request
    const existing = await this.accessRequestRepo.findOne({
      where: { email: dto.email, status: AccessRequestStatus.PENDING },
    });
    if (existing) {
      throw new ConflictException('You already have a pending access request. Please wait for it to be reviewed.');
    }

    const request = this.accessRequestRepo.create({
      name: dto.name,
      email: dto.email,
      message: dto.message || null,
      tenantId: dto.tenantId || null,
      newTenantName: dto.newTenantName || null,
      status: AccessRequestStatus.PENDING,
    });

    const saved = await this.accessRequestRepo.save(request);
    return this.toResponse(saved);
  }

  /**
   * List pending requests for admin's tenant
   */
  async findPendingForTenant(tenantId: string): Promise<AccessRequestResponse[]> {
    const requests = await this.accessRequestRepo.find({
      where: { tenantId, status: AccessRequestStatus.PENDING },
      order: { createdAt: 'DESC' },
    });
    return Promise.all(requests.map((r) => this.toResponse(r)));
  }

  /**
   * List all pending requests (super admin)
   */
  async findAllPending(): Promise<AccessRequestResponse[]> {
    const requests = await this.accessRequestRepo.find({
      where: { status: AccessRequestStatus.PENDING },
      order: { createdAt: 'DESC' },
    });
    return Promise.all(requests.map((r) => this.toResponse(r)));
  }

  /**
   * Approve an access request (admin or super admin)
   * - Admin: can only approve requests for their own tenant, creates USER
   * - Super Admin: can approve any request, creates ADMIN for new tenants
   */
  async approve(
    requestId: string,
    reviewerId: string,
    reviewerRole: UserRole,
    reviewerTenantId: string,
    dto?: ApproveAccessRequestDto,
  ): Promise<{ message: string }> {
    const request = await this.accessRequestRepo.findOne({ where: { id: requestId } });
    if (!request) {
      throw new NotFoundException('Access request not found');
    }
    if (request.status !== AccessRequestStatus.PENDING) {
      throw new BadRequestException('This request has already been reviewed');
    }

    // Determine target tenant
    let targetTenantId: string;

    if (request.tenantId) {
      // Joining existing tenant
      if (reviewerRole === UserRole.ADMIN && request.tenantId !== reviewerTenantId) {
        throw new BadRequestException('You can only approve requests for your own tenant');
      }
      targetTenantId = request.tenantId;
    } else if (request.newTenantName) {
      // Creating new tenant — only super admin
      if (reviewerRole !== UserRole.SUPER_ADMIN) {
        throw new BadRequestException('Only super admins can approve requests for new tenants');
      }
      const slug = this.generateSlug(request.newTenantName);
      const existingTenant = await this.tenantRepo.findOne({ where: { slug } });
      if (existingTenant) {
        throw new ConflictException(`Tenant slug "${slug}" already exists`);
      }
      const newTenant = this.tenantRepo.create({
        name: request.newTenantName,
        slug,
        settings: { maxAssistants: 10, monthlyTokenLimit: 1000000 },
        isActive: true,
      });
      const saved = await this.tenantRepo.save(newTenant);
      targetTenantId = saved.id;
    } else {
      // No tenant specified and no new tenant name — assign to reviewer's tenant
      targetTenantId = reviewerTenantId;
    }

    // Check if user already exists (email is globally unique)
    const existingUser = await this.userRepo.findOne({
      where: { email: request.email },
    });
    if (existingUser) {
      throw new ConflictException('A user with this email already exists. Each email can only be associated with one account.');
    }

    // Determine role: admin creates users, super admin creating new tenant creates admin
    const userRole = (request.newTenantName && reviewerRole === UserRole.SUPER_ADMIN)
      ? UserRole.ADMIN
      : UserRole.USER;

    // Generate password
    const tempPassword = dto?.password || this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const user = this.userRepo.create({
      tenantId: targetTenantId,
      email: request.email,
      name: request.name,
      passwordHash,
      role: userRole,
      isActive: true,
    });
    await this.userRepo.save(user);

    // Mark request as approved
    request.status = AccessRequestStatus.APPROVED;
    request.reviewedBy = reviewerId;
    request.reviewedAt = new Date();
    await this.accessRequestRepo.save(request);

    this.logger.log(`Access request ${requestId} approved. User ${request.email} created as ${userRole}`);
    return { message: `User ${request.email} has been approved and created as ${userRole}. Temporary password: ${tempPassword}` };
  }

  /**
   * Reject an access request
   */
  async reject(
    requestId: string,
    reviewerId: string,
    reviewerRole: UserRole,
    reviewerTenantId: string,
  ): Promise<{ message: string }> {
    const request = await this.accessRequestRepo.findOne({ where: { id: requestId } });
    if (!request) {
      throw new NotFoundException('Access request not found');
    }
    if (request.status !== AccessRequestStatus.PENDING) {
      throw new BadRequestException('This request has already been reviewed');
    }

    // Admin can only reject requests for their tenant
    if (reviewerRole === UserRole.ADMIN && request.tenantId !== reviewerTenantId) {
      throw new BadRequestException('You can only reject requests for your own tenant');
    }

    request.status = AccessRequestStatus.REJECTED;
    request.reviewedBy = reviewerId;
    request.reviewedAt = new Date();
    await this.accessRequestRepo.save(request);

    return { message: `Access request from ${request.email} has been rejected` };
  }

  /**
   * Get list of public tenants (for the access request form)
   */
  async getPublicTenants(): Promise<{ id: string; name: string }[]> {
    const tenants = await this.tenantRepo.find({
      where: { isActive: true },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
    // Filter out 'system' tenant
    return tenants.filter((t) => t.name !== 'System Administration');
  }

  private async toResponse(request: AccessRequest): Promise<AccessRequestResponse> {
    let tenantName: string | null = null;
    if (request.tenantId) {
      const tenant = await this.tenantRepo.findOne({ where: { id: request.tenantId } });
      tenantName = tenant?.name || null;
    }
    return {
      id: request.id,
      name: request.name,
      email: request.email,
      message: request.message,
      tenantId: request.tenantId,
      tenantName,
      newTenantName: request.newTenantName,
      status: request.status,
      reviewedBy: request.reviewedBy,
      reviewedAt: request.reviewedAt,
      createdAt: request.createdAt,
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50) + '-' + uuidv4().substring(0, 8);
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
