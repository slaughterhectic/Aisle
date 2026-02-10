'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sidebar = Sidebar;
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const scroll_area_1 = require("@/components/ui/scroll-area");
const avatar_1 = require("@/components/ui/avatar");
const use_auth_store_1 = require("@/store/use-auth-store");
const use_chat_1 = require("@/hooks/use-chat");
const dropdown_menu_1 = require("@/components/ui/dropdown-menu");
function Sidebar() {
    const pathname = (0, navigation_1.usePathname)();
    const { user, logout } = (0, use_auth_store_1.useAuthStore)();
    const { conversations } = (0, use_chat_1.useChat)();
    return (<div className="flex h-full w-[280px] flex-col border-r bg-gray-50/40 dark:bg-gray-900/40">
      <div className="flex h-14 items-center border-b px-4">
        <link_1.default href="/chat" className="flex items-center gap-2 font-semibold">
          <lucide_react_1.Bot className="h-6 w-6"/>
          <span>Aisle AI</span>
        </link_1.default>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <div className="px-4 py-2">
          <button_1.Button asChild variant="outline" className="w-full justify-start gap-2">
            <link_1.default href="/chat">
              <lucide_react_1.Plus className="h-4 w-4"/>
              New Chat
            </link_1.default>
          </button_1.Button>
        </div>

        <div className="px-4 py-2">
          <h3 className="mb-2 px-2 text-xs font-semibold text-gray-500">
            Recent Chats
          </h3>
          <scroll_area_1.ScrollArea className="h-[300px]">
            <div className="space-y-1">
              {conversations?.map((chat) => (<button_1.Button key={chat.id} asChild variant={pathname === `/chat/${chat.id}` ? 'secondary' : 'ghost'} className="w-full justify-start truncate">
                  <link_1.default href={`/chat/${chat.id}`}>
                    <lucide_react_1.MessageSquare className="mr-2 h-4 w-4"/>
                    <span className="truncate">{chat.title || 'New Conversation'}</span>
                  </link_1.default>
                </button_1.Button>))}
              {!conversations?.length && (<div className="px-2 text-sm text-gray-500">No recent chats</div>)}
            </div>
          </scroll_area_1.ScrollArea>
        </div>

        <div className="px-4 py-2">
           <h3 className="mb-2 px-2 text-xs font-semibold text-gray-500">
            Manage
          </h3>
          <nav className="space-y-1">
            <button_1.Button asChild variant="ghost" className="w-full justify-start">
              <link_1.default href="/assistants">
                <lucide_react_1.Bot className="mr-2 h-4 w-4"/>
                Assistants
              </link_1.default>
            </button_1.Button>
            <button_1.Button asChild variant="ghost" className="w-full justify-start">
              <link_1.default href="/knowledge">
                <lucide_react_1.Database className="mr-2 h-4 w-4"/>
                Knowledge Base
              </link_1.default>
            </button_1.Button>
            <button_1.Button asChild variant="ghost" className="w-full justify-start">
               <link_1.default href="/settings">
                <lucide_react_1.Settings className="mr-2 h-4 w-4"/>
                Settings
              </link_1.default>
            </button_1.Button>
          </nav>
        </div>
      </div>

      <div className="border-t p-4">
        <dropdown_menu_1.DropdownMenu>
          <dropdown_menu_1.DropdownMenuTrigger asChild>
            <button_1.Button variant="ghost" className="w-full justify-start gap-2 px-2">
              <avatar_1.Avatar className="h-6 w-6">
                <avatar_1.AvatarImage src=""/>
                <avatar_1.AvatarFallback>{user?.name?.[0]}</avatar_1.AvatarFallback>
              </avatar_1.Avatar>
              <div className="flex flex-col items-start text-xs">
                <span className="font-medium">{user?.name}</span>
                <span className="text-gray-500 truncate w-[140px]">{user?.email}</span>
              </div>
            </button_1.Button>
          </dropdown_menu_1.DropdownMenuTrigger>
          <dropdown_menu_1.DropdownMenuContent align="end" className="w-56">
            <dropdown_menu_1.DropdownMenuLabel>My Account</dropdown_menu_1.DropdownMenuLabel>
            <dropdown_menu_1.DropdownMenuSeparator />
            <dropdown_menu_1.DropdownMenuItem onClick={logout} className="text-red-600">
              <lucide_react_1.LogOut className="mr-2 h-4 w-4"/>
              Log out
            </dropdown_menu_1.DropdownMenuItem>
          </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>
      </div>
    </div>);
}
//# sourceMappingURL=sidebar.js.map