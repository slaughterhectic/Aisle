'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from '@/hooks/use-chat';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ChatInterfaceProps {
  conversationId?: string;
}

export function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const router = useRouter();
  const { 
    messages, 
    messagesError, 
    sendMessage, 
    isLoading 
  } = useChat(conversationId);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (bottomRef.current) {
       bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (content: string) => {
    try {
      const newId = await sendMessage(content);
      // If we were on new chat page and got a new ID, redirect
      if (!conversationId && newId) {
        router.push(`/chat/${newId}`);
      }
    } catch (error) {
      console.error('Send failed', error);
      // Toast error here ideally
    }
  };

  if (messagesError) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>
             Failed to load conversation history. Please try refreshing the page.
           </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages || []} isLoading={isLoading} />
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
