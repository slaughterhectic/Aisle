export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: string;
}
export interface Conversation {
    id: string;
    title?: string;
    updatedAt: string;
}
export declare function useChat(conversationId?: string): {
    conversations: Conversation[] | undefined;
    conversationsError: any;
    messages: Message[] | undefined;
    messagesError: any;
    sendMessage: (content: string, assistantId?: string) => Promise<any>;
    isLoading: boolean;
    mutateConversations: import("swr").KeyedMutator<Conversation[]>;
};
