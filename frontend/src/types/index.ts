export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  tenant?: Tenant;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AccessRequestFormData {
  name: string;
  email: string;
  message?: string;
  tenantId?: string;
  newTenantName?: string;
}

export interface AccessRequest {
  id: string;
  name: string;
  email: string;
  message: string | null;
  tenantId: string | null;
  tenantName: string | null;
  newTenantName: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}
