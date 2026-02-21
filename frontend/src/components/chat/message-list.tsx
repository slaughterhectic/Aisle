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
      <div className="flex h-full flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
        <div className="mb-8 flex flex-col items-center">
          <div className="h-16 w-16 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg mb-6 shadow-purple-500/30">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
            Welcome to Aisle AI
          </h2>
          <p className="text-slate-500 max-w-md dark:text-slate-400">
            Start a conversation by typing a message below. Ask questions about your documents or any general topics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-4xl mx-auto">
      {messages.map((msg, index) => (
        <div
          key={msg.id || index}
          className={cn(
            'flex gap-4 md:gap-6 animate-in slide-in-from-bottom-2 duration-300 group',
            msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <Avatar className={cn('h-9 w-9 shrink-0 shadow-sm border-2 border-white dark:border-slate-950', msg.role === 'user' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-emerald-400 to-teal-500')}>
            <AvatarFallback className="text-white text-xs font-medium">
              {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
          
          <div className={cn(
            'flex flex-col gap-1.5 min-w-0 max-w-[85%] md:max-w-[75%]',
            msg.role === 'user' ? 'items-end' : 'items-start'
          )}>
            <div className={cn(
              'rounded-2xl px-5 py-3.5 text-sm shadow-sm transition-all text-slate-800 dark:text-slate-100',
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm shadow-purple-500/20' 
                : 'bg-white border text-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800 rounded-tl-sm shadow-slate-200/50 dark:shadow-none'
            )}>
              <div className="prose prose-sm dark:prose-invert break-words max-w-none leading-relaxed">
                <ReactMarkdown 
                  components={{
                    pre: ({ node, ...props }) => (
                      <div className="overflow-auto w-full my-3 bg-slate-950/90 text-slate-50 p-4 rounded-xl border border-slate-800/50 shadow-inner">
                        <pre {...props} />
                      </div>
                    ),
                    code: ({ node, className, ...props }) => {
                       const match = /language-(\w+)/.exec(className || '');
                       return !match ? (
                         <code className="bg-black/10 dark:bg-white/10 rounded-md px-1.5 py-0.5 font-mono text-xs" {...props} />
                       ) : (
                         <code className={className} {...props} />
                       )
                    },
                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />
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
        <div className="flex gap-4 md:gap-6 animate-in slide-in-from-bottom-2">
          <Avatar className="h-9 w-9 shrink-0 shadow-sm border-2 border-white dark:border-slate-950 bg-gradient-to-br from-emerald-400 to-teal-500">
            <AvatarFallback><Bot className="h-5 w-5 text-white" /></AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1.5 bg-white border px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm dark:bg-slate-900 dark:border-slate-800 text-slate-500">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></span>
          </div>
        </div>
      )}
    </div>
  );
}
