import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { LLMProvider, LLMMessage, LLMOptions, LLMResponse } from './interfaces/llm-provider.interface';
import { LLMProvider as LLMProviderEnum } from '../../database/entities/assistant.entity';

export type { LLMMessage, LLMOptions, LLMResponse };

/**
 * LLM Gateway Service
 * Unified interface for calling different LLM providers.
 */
@Injectable()
export class LlmGatewayService {
  private readonly logger = new Logger(LlmGatewayService.name);
  private readonly providers: Map<string, LLMProvider> = new Map();
  private readonly defaultProvider: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly openaiProvider: OpenAIProvider,
    private readonly anthropicProvider: AnthropicProvider,
    private readonly openrouterProvider: OpenRouterProvider,
  ) {
    // Register providers
    this.providers.set('openai', openaiProvider);
    this.providers.set('anthropic', anthropicProvider);
    this.providers.set('openrouter', openrouterProvider);

    this.defaultProvider = this.configService.get<string>('llm.defaultProvider') || 'openai';
  }

  /**
   * Send chat request to the appropriate provider
   */
  async chat(
    messages: LLMMessage[],
    options: {
      provider?: LLMProviderEnum | string;
      model?: string;
      temperature?: number;
      maxTokens?: number;
    },
  ): Promise<LLMResponse> {
    const providerName = options.provider || this.defaultProvider;
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new BadRequestException(`Unknown LLM provider: ${providerName}`);
    }

    if (!provider.isAvailable()) {
      throw new BadRequestException(`LLM provider ${providerName} is not configured`);
    }

    const llmOptions: LLMOptions = {
      model: options.model || this.getDefaultModel(providerName),
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    };

    const startTime = Date.now();

    try {
      const response = await provider.chat(messages, llmOptions);
      
      const latencyMs = Date.now() - startTime;
      this.logger.log(
        `LLM call completed: provider=${providerName}, model=${response.model}, ` +
        `tokens=${response.usage.totalTokens}, latency=${latencyMs}ms`,
      );

      return response;
    } catch (error) {
      this.logger.error(`LLM call failed: provider=${providerName}`, error);
      throw error;
    }
  }

  /**
   * Get default model for a provider
   */
  private getDefaultModel(provider: string): string {
    switch (provider) {
      case 'openai':
        return this.configService.get<string>('llm.defaultModel') || 'gpt-4o-mini';
      case 'anthropic':
        return 'claude-3-sonnet-20240229';
      case 'openrouter':
        return 'openai/gpt-4o-mini';
      default:
        return 'gpt-4o-mini';
    }
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.entries())
      .filter(([_, provider]) => provider.isAvailable())
      .map(([name]) => name);
  }

  /**
   * Count tokens in text using the appropriate provider
   */
  countTokens(text: string, provider?: string): number {
    const providerName = provider || this.defaultProvider;
    const p = this.providers.get(providerName);
    return p?.countTokens(text) || Math.ceil(text.length / 4);
  }
}
