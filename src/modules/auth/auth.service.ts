import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../database/entities/user.entity';
import { Tenant } from '../../database/entities/tenant.entity';
import { RegisterDto, LoginDto, RefreshTokenDto, AuthResponse } from './dto/auth.dto';
import { JwtPayload, UserRole } from '../../common/interfaces/tenant-context.interface';

/**
 * Authentication Service
 * Handles user registration, login, and token management.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user
   * If tenantSlug is not provided, creates a new tenant
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    let tenant: Tenant;

    if (dto.tenantSlug) {
      // Join existing tenant
      const foundTenant = await this.tenantRepository.findOne({
        where: { slug: dto.tenantSlug },
      });
      if (!foundTenant) {
        throw new NotFoundException(`Tenant with slug "${dto.tenantSlug}" not found`);
      }
      tenant = foundTenant;
    } else {
      // Create new tenant
      const tenantName = dto.tenantName || `${dto.name}'s Organization`;
      const tenantSlug = this.generateSlug(tenantName);

      // Check if slug already exists
      const existingTenant = await this.tenantRepository.findOne({
        where: { slug: tenantSlug },
      });
      if (existingTenant) {
        throw new ConflictException(`Tenant slug "${tenantSlug}" already exists`);
      }

      tenant = this.tenantRepository.create({
        name: tenantName,
        slug: tenantSlug,
        settings: {
          maxAssistants: 10,
          maxStorageBytes: 1073741824, // 1GB
          monthlyTokenLimit: 1000000,
        },
      });
      await this.tenantRepository.save(tenant);
    }

    // Check if user already exists in this tenant
    const existingUser = await this.userRepository.findOne({
      where: { tenantId: tenant.id, email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists in this tenant');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create user (first user in new tenant is admin)
    const isFirstUser = !dto.tenantSlug;
    const user = this.userRepository.create({
      tenantId: tenant.id,
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: isFirstUser ? UserRole.ADMIN : UserRole.USER,
    });
    await this.userRepository.save(user);

    // Generate tokens
    return this.generateAuthResponse(user, tenant);
  }

  /**
   * Login user
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    // Find tenant
    const tenant = await this.tenantRepository.findOne({
      where: { slug: dto.tenantSlug },
    });
    if (!tenant) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Find user
    const user = await this.userRepository.findOne({
      where: { tenantId: tenant.id, email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account is disabled');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    return this.generateAuthResponse(user, tenant);
  }

  /**
   * Refresh access token
   */
  async refreshToken(dto: RefreshTokenDto): Promise<AuthResponse> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(dto.refreshToken, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      // Find user
      const user = await this.userRepository.findOne({
        where: { id: payload.sub, tenantId: payload.tenantId },
      });
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tenant = await this.tenantRepository.findOne({
        where: { id: payload.tenantId },
      });
      if (!tenant) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateAuthResponse(user, tenant);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Generate JWT tokens and auth response
   */
  private async generateAuthResponse(user: User, tenant: Tenant): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      tenantId: tenant.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload as object);
    const refreshToken = await this.jwtService.signAsync(payload as object, {
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn') || '7d',
    } as any);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get<string>('jwt.expiresIn') || '1d',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: tenant.id,
        tenantName: tenant.name,
      },
    };
  }

  /**
   * Generate URL-safe slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50) + '-' + uuidv4().substring(0, 8);
  }
}
