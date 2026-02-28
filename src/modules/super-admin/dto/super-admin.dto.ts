import { IsString, IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { UserRole } from '../../../common/interfaces/tenant-context.interface';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;
}

export class CreateUserBySuperAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  @IsOptional()
  tenantId?: string; // If optional, we might need a way to assign to "system" or let the service decide. Let's make it optional and if not provided, create a new tenant or fail? Actually, they want to link to existing or new tenant.

  // Instead of an optional tenantId, let's provide either tenantId or newTenant details.
  @IsOptional()
  newTenantName?: string;
  
  @IsOptional()
  newTenantSlug?: string;
}
