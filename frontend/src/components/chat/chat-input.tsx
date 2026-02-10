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
    <div className="p-4 border-t bg-white dark:bg-gray-950">
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2 max-w-3xl mx-auto">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="shrink-0 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach file</span>
        </Button>
        
        <div className="relative flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[40px] max-h-[200px]"
            rows={1}
            disabled={isLoading}
          />
        </div>

        <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
          <span className="sr-only">Send</span>
        </Button>
      </form>
      <div className="text-center mt-2">
        <p className="text-xs text-gray-400">
          Aisle can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
