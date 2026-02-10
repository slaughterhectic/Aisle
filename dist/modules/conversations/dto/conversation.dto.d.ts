export declare class CreateConversationDto {
    assistantId: string;
    title?: string;
}
export declare class ChatMessageDto {
    message: string;
}
export interface ConversationResponse {
    id: string;
    assistantId: string;
    assistantName: string;
    userId: string;
    title: string | null;
    totalTokensUsed: number;
    createdAt: Date;
}
export interface MessageResponse {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    tokensUsed: number;
    model: string | null;
    createdAt: Date;
}
export interface ChatResponse {
    message: MessageResponse;
    conversationId: string;
    tokensUsed: {
        input: number;
        output: number;
        total: number;
    };
    contextChunks?: {
        documentId: string;
        content: string;
        score: number;
    }[];
}
