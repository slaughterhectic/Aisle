import { Tenant } from './tenant.entity';
export declare enum LLMProvider {
    OPENAI = "openai",
    ANTHROPIC = "anthropic",
    OPENROUTER = "openrouter"
}
export declare class Assistant {
    id: string;
    tenantId: string;
    tenant: Tenant;
    name: string;
    description: string;
    systemPrompt: string;
    provider: LLMProvider;
    model: string;
    temperature: number;
    maxTokens: number;
    ragEnabled: boolean;
    ragTopK: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
