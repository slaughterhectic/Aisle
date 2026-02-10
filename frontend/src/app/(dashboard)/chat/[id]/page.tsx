'use client';

import { ChatInterface } from '@/components/chat/chat-interface';
import { useParams } from 'next/navigation';

export default function ExistingChatPage() {
  const params = useParams();
  const id = params.id as string;

  return <ChatInterface conversationId={id} />;
}
