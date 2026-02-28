export declare class CreateAccessRequestDto {
    name: string;
    email: string;
    message?: string;
    tenantId?: string;
    newTenantName?: string;
}
export declare class ApproveAccessRequestDto {
    password?: string;
}
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
