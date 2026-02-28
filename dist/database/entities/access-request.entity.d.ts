export declare enum AccessRequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class AccessRequest {
    id: string;
    name: string;
    email: string;
    message: string | null;
    tenantId: string | null;
    newTenantName: string | null;
    status: AccessRequestStatus;
    reviewedBy: string | null;
    reviewedAt: Date | null;
    createdAt: Date;
}
