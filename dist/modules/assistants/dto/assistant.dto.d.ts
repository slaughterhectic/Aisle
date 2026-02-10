import { LLMProvider } from '../../../database/entities/assistant.entity';
export declare class CreateAssistantDto {
    name: string;
    description?: string;
    systemPrompt: string;
    provider?: LLMProvider;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    ragEnabled?: boolean;
    ragTopK?: number;
}
export declare class UpdateAssistantDto {
    name?: string;
    description?: string;
    systemPrompt?: string;
    provider?: LLMProvider;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    ragEnabled?: boolean;
    ragTopK?: number;
    isActive?: boolean;
}
export interface AssistantResponse {
    id: string;
    name: string;
    description: string | null;
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
