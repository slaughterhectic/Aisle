import useSWR from 'swr';
import api from '@/lib/api';
import { useState, useCallback } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title?: string;
  assistantId: string;
  assistantName: string;
  updatedAt: string;
}

export interface Assistant {
  id: string;
  name: string;
  description: string | null;
  provider: string;
  model: string;
  isActive: boolean;
}

const fetcher = (url: string) => api.get(url).then((res: any) => res.data);

/**
 * Ensures at least one assistant exists for the current tenant.
 * If none exist, creates a default one and returns its ID.
 * Otherwise returns the first available assistant's ID.
 */
async function ensureAssistant(): Promise<string> {
  try {
    const res = await api.get<Assistant[]>('/assistants');
    const assistants = res.data;
    if (assistants && assistants.length > 0) {
      return assistants[0].id;
    }
  } catch {
    // If fetching fails, we'll try to create one
  }

  // No assistants exist — create a default one
  const createRes = await api.post<Assistant>('/assistants', {
    name: 'General Assistant',
    description: 'A helpful AI assistant powered by your knowledge base.',
    systemPrompt:
      'You are a helpful, friendly AI assistant. Answer questions accurately and concisely. If you are provided with context from documents, use it to inform your answers and cite the sources when possible.',
    provider: 'openrouter',
    model: 'openai/gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 2048,
    ragEnabled: true,
    ragTopK: 5,
  });

  return createRes.data.id;
}

export function useChat(options?: { conversationId?: string }) {
  const { conversationId } = options || {};

  // Fetch conversations list
  const {
    data: conversations,
    error: conversationsError,
    mutate: mutateConversations,
  } = useSWR<Conversation[]>('/conversations', fetcher);

  // Fetch messages for active conversation
  const {
    data: messages,
    error: messagesError,
    mutate: mutateMessages,
  } = useSWR<Message[]>(
    conversationId ? `/conversations/${conversationId}/messages` : null,
    fetcher,
  );

  const [isLoading, setIsLoading] = useState(false);

  // Send message function
  const sendMessage = useCallback(
    async (content: string) => {
      setIsLoading(true);
      try {
        if (!conversationId) {
          // Ensure we have an assistant before creating a conversation
          const assistantId = await ensureAssistant();

          // Start new conversation
          const res = await api.post<Conversation>('/conversations', {
            assistantId,
          });
          const newConversation = res.data;

          // Send first message
          await api.post(`/conversations/${newConversation.id}/chat`, {
            message: content,
          });

          // Update list and return new ID
          mutateConversations();
          return newConversation.id;
        } else {
          // Send to existing conversation
          const userMsg: Message = {
            id: 'temp-user',
            role: 'user',
            content,
            createdAt: new Date().toISOString(),
          };
          mutateMessages(
            (current) => [...(current || []), userMsg],
            false,
          );

          await api.post(`/conversations/${conversationId}/chat`, {
            message: content,
          });

          mutateMessages(); // Revalidate to get exact server state
          return conversationId;
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        mutateMessages(); // Revalidate on failure to remove optimistic update
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, mutateConversations, mutateMessages],
  );

  return {
    conversations,
    conversationsError,
    messages,
    messagesError,
    sendMessage,
    isLoading,
    mutateConversations,
  };
}
