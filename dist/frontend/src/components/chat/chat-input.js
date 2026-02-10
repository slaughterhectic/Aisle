"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatInput = ChatInput;
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
function ChatInput({ onSend, isLoading }) {
    const [input, setInput] = (0, react_1.useState)('');
    const textareaRef = (0, react_1.useRef)(null);
    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!input.trim() || isLoading)
            return;
        const message = input;
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
        await onSend(message);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };
    const handleInput = (e) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };
    return (<div className="p-4 border-t bg-white dark:bg-gray-950">
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2 max-w-3xl mx-auto">
        <button_1.Button type="button" variant="ghost" size="icon" className="shrink-0 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
          <lucide_react_1.Paperclip className="h-5 w-5"/>
          <span className="sr-only">Attach file</span>
        </button_1.Button>
        
        <div className="relative flex-1 min-w-0">
          <textarea ref={textareaRef} value={input} onChange={handleInput} onKeyDown={handleKeyDown} placeholder="Send a message..." className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[40px] max-h-[200px]" rows={1} disabled={isLoading}/>
        </div>

        <button_1.Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
          {isLoading ? (<lucide_react_1.Loader2 className="h-4 w-4 animate-spin"/>) : (<lucide_react_1.SendHorizontal className="h-4 w-4"/>)}
          <span className="sr-only">Send</span>
        </button_1.Button>
      </form>
      <div className="text-center mt-2">
        <p className="text-xs text-gray-400">
          Aisle can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>);
}
//# sourceMappingURL=chat-input.js.map