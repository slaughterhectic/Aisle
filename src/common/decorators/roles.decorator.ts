import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../interfaces/tenant-context.interface';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for accessing an endpoint.
 * 
 * Usage:
 * ```typescript
 * @Roles(UserRole.ADMIN)
 * @Get('admin-only')
 * adminEndpoint() { }
 * 
 * @Roles(UserRole.ADMIN, UserRole.MANAGER)
 * @Get('managers')
 * managersEndpoint() { }
 * ```
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
