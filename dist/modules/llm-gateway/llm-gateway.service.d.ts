import { ConfigService } from '@nestjs/config';
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { LLMMessage, LLMOptions, LLMResponse } from './interfaces/llm-provider.interface';
import { LLMProvider as LLMProviderEnum } from '../../database/entities/assistant.entity';
export type { LLMMessage, LLMOptions, LLMResponse };
export declare class LlmGatewayService {
    private readonly configService;
    private readonly openaiProvider;
    private readonly anthropicProvider;
    private readonly openrouterProvider;
    private readonly logger;
    private readonly providers;
    private readonly defaultProvider;
    constructor(configService: ConfigService, openaiProvider: OpenAIProvider, anthropicProvider: AnthropicProvider, openrouterProvider: OpenRouterProvider);
    chat(messages: LLMMessage[], options: {
        provider?: LLMProviderEnum | string;
        model?: string;
        temperature?: number;
        maxTokens?: number;
    }): Promise<LLMResponse>;
    private getDefaultModel;
    getAvailableProviders(): string[];
    countTokens(text: string, provider?: string): number;
}
