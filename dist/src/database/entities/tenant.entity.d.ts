export declare class Tenant {
    id: string;
    name: string;
    slug: string;
    settings: TenantSettings;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface TenantSettings {
    maxAssistants?: number;
    maxStorageBytes?: number;
    monthlyTokenLimit?: number;
    allowedProviders?: string[];
    branding?: {
        primaryColor?: string;
        logoUrl?: string;
    };
}
