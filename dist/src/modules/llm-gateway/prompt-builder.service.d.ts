import { LLMMessage } from './interfaces/llm-provider.interface';
export declare class PromptBuilderService {
    private readonly logger;
    buildPromptWithContext(systemPrompt: string, contextChunks: string[], conversationHistory: LLMMessage[], userMessage: string): LLMMessage[];
    estimateTokens(messages: LLMMessage[]): number;
    truncateToFit(messages: LLMMessage[], maxTokens: number): LLMMessage[];
}
