"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageList = MessageList;
const avatar_1 = require("@/components/ui/avatar");
const utils_1 = require("@/lib/utils");
const lucide_react_1 = require("lucide-react");
const react_markdown_1 = __importDefault(require("react-markdown"));
function MessageList({ messages, isLoading }) {
    if (!messages?.length) {
        return (<div className="flex h-full flex-col items-center justify-center p-8 text-center text-gray-500">
        <lucide_react_1.Bot className="mb-4 h-12 w-12 text-gray-300"/>
        <h3 className="text-lg font-semibold">Welcome to Aisle AI</h3>
        <p className="max-w-sm">
          Start a conversation by typing a message below. You can ask questions about your documents or general topics.
        </p>
      </div>);
    }
    return (<div className="flex flex-col gap-6 p-4 md:p-6">
      {messages.map((msg, index) => (<div key={msg.id || index} className={(0, utils_1.cn)('flex gap-4 md:gap-6', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
          <avatar_1.Avatar className={(0, utils_1.cn)('h-8 w-8', msg.role === 'user' ? 'bg-primary' : 'bg-green-600')}>
            <avatar_1.AvatarFallback className="text-white">
              {msg.role === 'user' ? <lucide_react_1.User className="h-5 w-5"/> : <lucide_react_1.Bot className="h-5 w-5"/>}
            </avatar_1.AvatarFallback>
          </avatar_1.Avatar>
          
          <div className={(0, utils_1.cn)('flex flex-col gap-1 min-w-0 max-w-[80%] md:max-w-[70%]', msg.role === 'user' ? 'items-end' : 'items-start')}>
            <div className={(0, utils_1.cn)('rounded-lg px-4 py-3 text-sm shadow-sm', msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-white border text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700')}>
              <div className="prose prose-sm dark:prose-invert break-words">
                <react_markdown_1.default components={{
                pre: ({ node, ...props }) => (<div className="overflow-auto w-full my-2 bg-black/10 dark:bg-black/30 p-2 rounded-md">
                        <pre {...props}/>
                      </div>),
                code: ({ node, ...props }) => (<code className="bg-black/10 dark:bg-black/30 rounded px-1 py-0.5" {...props}/>)
            }}>
                  {msg.content}
                </react_markdown_1.default>
              </div>
            </div>
          </div>
        </div>))}
      
      {isLoading && (<div className="flex gap-4 md:gap-6 p-4">
          <avatar_1.Avatar className="h-8 w-8 bg-green-600">
            <avatar_1.AvatarFallback><lucide_react_1.Bot className="h-5 w-5 text-white"/></avatar_1.AvatarFallback>
          </avatar_1.Avatar>
          <div className="flex items-center gap-1 bg-white border px-4 py-3 rounded-lg dark:bg-gray-800 dark:border-gray-700">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
          </div>
        </div>)}
    </div>);
}
//# sourceMappingURL=message-list.js.map