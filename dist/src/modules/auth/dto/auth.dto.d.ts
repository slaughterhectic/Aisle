import { UserRole } from '../../../common/interfaces/tenant-context.interface';
export declare class RegisterDto {
    email: string;
    password: string;
    name: string;
    tenantSlug?: string;
    tenantName?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
    tenantSlug: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        tenantId: string;
        tenantName: string;
    };
}
