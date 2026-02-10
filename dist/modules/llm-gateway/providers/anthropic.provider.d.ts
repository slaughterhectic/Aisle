import { ConfigService } from '@nestjs/config';
import { LLMProvider, LLMMessage, LLMOptions, LLMResponse } from '../interfaces/llm-provider.interface';
export declare class AnthropicProvider implements LLMProvider {
    private readonly configService;
    private readonly logger;
    private readonly client;
    readonly name = "anthropic";
    constructor(configService: ConfigService);
    isAvailable(): boolean;
    chat(messages: LLMMessage[], options: LLMOptions): Promise<LLMResponse>;
    countTokens(text: string): number;
    private mapStopReason;
}
