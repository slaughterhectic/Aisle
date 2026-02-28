/**
 * Tenant Context Interface
 * Represents the resolved tenant context for every authenticated request.
 * This is the core of multi-tenancy - all operations must be scoped to this context.
 */
export interface TenantContext {
  /** Unique identifier for the tenant (organization) */
  tenantId: string;
  
  /** Unique identifier for the authenticated user */
  userId: string;
  
  /** User's role within the tenant */
  role: UserRole;
  
  /** User's email for reference */
  email: string;
}

/**
 * User roles for RBAC
 */
export enum UserRole {
  /** Super Admin - can manage all tenants and users */
  SUPER_ADMIN = 'super_admin',
  
  /** Full access - can manage tenant settings, users, assistants, knowledge bases */
  ADMIN = 'admin',
  
  /** Can only use assistants (chat) */
  USER = 'user',
}

/**
 * JWT Payload structure
 */
export interface JwtPayload {
  sub: string;        // User ID
  tenantId: string;   // Tenant ID
  email: string;      // User email
  role: UserRole;     // User role
  iat?: number;       // Issued at
  exp?: number;       // Expiration
}

/**
 * Authenticated request with tenant context
 */
export interface AuthenticatedRequest extends Request {
  user: TenantContext;
}
