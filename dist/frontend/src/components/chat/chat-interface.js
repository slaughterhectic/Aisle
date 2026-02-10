'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatInterface = ChatInterface;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const use_chat_1 = require("@/hooks/use-chat");
const message_list_1 = require("./message-list");
const chat_input_1 = require("./chat-input");
const lucide_react_1 = require("lucide-react");
const alert_1 = require("@/components/ui/alert");
function ChatInterface({ conversationId }) {
    const router = (0, navigation_1.useRouter)();
    const { messages, messagesError, sendMessage, isLoading } = (0, use_chat_1.useChat)(conversationId);
    const bottomRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);
    const handleSend = async (content) => {
        try {
            const newId = await sendMessage(content);
            if (!conversationId && newId) {
                router.push(`/chat/${newId}`);
            }
        }
        catch (error) {
            console.error('Send failed', error);
        }
    };
    if (messagesError) {
        return (<div className="flex h-full items-center justify-center p-4">
        <alert_1.Alert variant="destructive" className="max-w-md">
           <lucide_react_1.AlertCircle className="h-4 w-4"/>
           <alert_1.AlertTitle>Error</alert_1.AlertTitle>
           <alert_1.AlertDescription>
             Failed to load conversation history. Please try refreshing the page.
           </alert_1.AlertDescription>
        </alert_1.Alert>
      </div>);
    }
    return (<div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <div className="flex-1 overflow-y-auto">
        <message_list_1.MessageList messages={messages || []} isLoading={isLoading}/>
        <div ref={bottomRef}/>
      </div>
      <chat_input_1.ChatInput onSend={handleSend} isLoading={isLoading}/>
    </div>);
}
//# sourceMappingURL=chat-interface.js.map