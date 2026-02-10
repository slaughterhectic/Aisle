export interface LLMProvider {
    readonly name: string;
    chat(messages: LLMMessage[], options: LLMOptions): Promise<LLMResponse>;
    countTokens(text: string): number;
    isAvailable(): boolean;
}
export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface LLMOptions {
    model: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stop?: string[];
}
export interface LLMResponse {
    content: string;
    model: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    finishReason: 'stop' | 'length' | 'content_filter' | 'error';
}
