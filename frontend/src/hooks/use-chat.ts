import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import api from '@/lib/api';
import { useState } from 'react';

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

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function useChat(conversationId?: string) {
  // Fetch conversations list
  const { data: conversations, error: conversationsError, mutate: mutateConversations } = useSWR<Conversation[]>('/conversations', fetcher);

  // Fetch messages for active conversation
  const { data: messages, error: messagesError, mutate: mutateMessages } = useSWR<Message[]>(
    conversationId ? `/conversations/${conversationId}/messages` : null,
    fetcher
  );

  const [isLoading, setIsLoading] = useState(false);

  // Send message function
  const sendMessage = async (content: string, assistantId?: string) => {
    setIsLoading(true);
    try {
      if (!conversationId) {
        // Start new conversation
        const res = await api.post<Conversation>('/conversations', { assistantId });
        const newConversation = res.data;
        
        // Send first message
        await api.post(`/conversations/${newConversation.id}/chat`, { message: content });
        
        // Update list and return new ID
        mutateConversations();
        return newConversation.id;
      } else {
        // Send to existing
        // Optimistic update could be done here
        const userMsg: Message = { id: 'temp-user', role: 'user', content, createdAt: new Date().toISOString() };
        mutateMessages((current) => [...(current || []), userMsg], false);
        
        const res = await api.post(`/conversations/${conversationId}/chat`, { message: content });
        const assistantMsg = res.data; // Assuming backend returns the assistant message or list
        
        mutateMessages(); // Revalidate to get exact server state
        return conversationId;
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    } finally {
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
