import { IsString, IsEmail, IsOptional, MaxLength, MinLength, IsUUID } from 'class-validator';

/**
 * DTO for submitting an access request (public, no auth needed)
 */
export class CreateAccessRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;

  /** If joining an existing tenant (UUID) */
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  /** If requesting a new tenant */
  @IsOptional()
  @IsString()
  @MaxLength(255)
  newTenantName?: string;
}

/**
 * DTO for approving an access request
 */
export class ApproveAccessRequestDto {
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string; // Optional: auto-generate if not provided
}

/**
 * Response shape for access requests
 */
export interface AccessRequestResponse {
  id: string;
  name: string;
  email: string;
  message: string | null;
  tenantId: string | null;
  tenantName: string | null;
  newTenantName: string | null;
  status: string;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
}
