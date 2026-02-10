"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChat = useChat;
const swr_1 = __importDefault(require("swr"));
const api_1 = __importDefault(require("@/lib/api"));
const react_1 = require("react");
const fetcher = (url) => api_1.default.get(url).then((res) => res.data);
function useChat(conversationId) {
    const { data: conversations, error: conversationsError, mutate: mutateConversations } = (0, swr_1.default)('/conversations', fetcher);
    const { data: messages, error: messagesError, mutate: mutateMessages } = (0, swr_1.default)(conversationId ? `/conversations/${conversationId}/messages` : null, fetcher);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const sendMessage = async (content, assistantId) => {
        setIsLoading(true);
        try {
            if (!conversationId) {
                const res = await api_1.default.post('/conversations', { assistantId });
                const newConversation = res.data;
                await api_1.default.post(`/conversations/${newConversation.id}/chat`, { message: content });
                mutateConversations();
                return newConversation.id;
            }
            else {
                const userMsg = { id: 'temp-user', role: 'user', content, createdAt: new Date().toISOString() };
                mutateMessages((current) => [...(current || []), userMsg], false);
                const res = await api_1.default.post(`/conversations/${conversationId}/chat`, { message: content });
                const assistantMsg = res.data;
                mutateMessages();
                return conversationId;
            }
        }
        catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    };
    return {
        conversations,
        conversationsError,
        messages,
        messagesError,
        sendMessage,
        isLoading,
        mutateConversations
    };
}
//# sourceMappingURL=use-chat.js.map