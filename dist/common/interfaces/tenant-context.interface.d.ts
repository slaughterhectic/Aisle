export interface TenantContext {
    tenantId: string;
    userId: string;
    role: UserRole;
    email: string;
}
export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    MANAGER = "manager",
    USER = "user"
}
export interface JwtPayload {
    sub: string;
    tenantId: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}
export interface AuthenticatedRequest extends Request {
    user: TenantContext;
}
