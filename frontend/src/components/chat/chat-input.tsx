import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SendHorizontal, Paperclip, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea'; // We might need to create this or use basic textarea

export interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput('');
    
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    await onSend(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="p-4 md:p-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 sticky bottom-0 z-10 w-full shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
      <form onSubmit={handleSubmit} className="relative flex items-end gap-3 max-w-4xl mx-auto bg-slate-50 dark:bg-slate-900 rounded-3xl p-2 pl-4 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all focus-within:shadow-md focus-within:border-purple-300 dark:focus-within:border-purple-700/50 focus-within:ring-4 focus-within:ring-purple-500/10 dark:focus-within:ring-purple-500/10">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="shrink-0 mb-0.5 text-slate-400 hover:text-purple-600 hover:bg-purple-100 rounded-full dark:hover:text-purple-400 dark:hover:bg-purple-500/20 transition-colors"
        >
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach file</span>
        </Button>
        
        <div className="relative flex-1 min-w-0 flex items-center mb-0.5">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="w-full resize-none border-0 bg-transparent px-2 py-3 text-[15px] focus:ring-0 placeholder:text-slate-400 dark:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] max-h-[200px] outline-none"
            rows={1}
            disabled={isLoading}
          />
        </div>

        <Button 
          type="submit" 
          size="icon" 
          disabled={!input.trim() || isLoading}
          className="shrink-0 mb-0.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:opacity-90 shadow-sm transition-all shadow-purple-500/20 disabled:opacity-50 h-11 w-11 border-0"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <SendHorizontal className="h-5 w-5 ml-0.5" />
          )}
          <span className="sr-only">Send</span>
        </Button>
      </form>
      <div className="text-center mt-3 max-w-4xl mx-auto">
        <p className="text-[11px] text-slate-400 font-medium tracking-wide">
          Multi Tenant Chat might generate inaccurate information. Please verify important details.
        </p>
      </div>
    </div>
  );
}
