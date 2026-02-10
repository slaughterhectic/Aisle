import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '@/hooks/use-chat';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  if (!messages?.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-gray-500">
        <Bot className="mb-4 h-12 w-12 text-gray-300" />
        <h3 className="text-lg font-semibold">Welcome to Aisle AI</h3>
        <p className="max-w-sm">
          Start a conversation by typing a message below. You can ask questions about your documents or general topics.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {messages.map((msg, index) => (
        <div
          key={msg.id || index}
          className={cn(
            'flex gap-4 md:gap-6',
            msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <Avatar className={cn('h-8 w-8', msg.role === 'user' ? 'bg-primary' : 'bg-green-600')}>
            <AvatarFallback className="text-white">
              {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
          
          <div className={cn(
            'flex flex-col gap-1 min-w-0 max-w-[80%] md:max-w-[70%]',
            msg.role === 'user' ? 'items-end' : 'items-start'
          )}>
            <div className={cn(
              'rounded-lg px-4 py-3 text-sm shadow-sm',
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-white border text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700'
            )}>
              <div className="prose prose-sm dark:prose-invert break-words">
                <ReactMarkdown 
                  components={{
                    pre: ({ node, ...props }) => (
                      <div className="overflow-auto w-full my-2 bg-black/10 dark:bg-black/30 p-2 rounded-md">
                        <pre {...props} />
                      </div>
                    ),
                    code: ({ node, ...props }) => (
                      <code className="bg-black/10 dark:bg-black/30 rounded px-1 py-0.5" {...props} />
                    )
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex gap-4 md:gap-6 p-4">
          <Avatar className="h-8 w-8 bg-green-600">
            <AvatarFallback><Bot className="h-5 w-5 text-white" /></AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1 bg-white border px-4 py-3 rounded-lg dark:bg-gray-800 dark:border-gray-700">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
          </div>
        </div>
      )}
    </div>
  );
}
