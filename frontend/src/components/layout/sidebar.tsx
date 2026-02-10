'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Plus, Settings, User, LogOut, Database, Bot } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/use-auth-store';
import { useChat } from '@/hooks/use-chat';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { conversations } = useChat();

  return (
    <div className="flex h-full w-[280px] flex-col border-r bg-gray-50/40 dark:bg-gray-900/40">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/chat" className="flex items-center gap-2 font-semibold">
          <Bot className="h-6 w-6" />
          <span>Aisle AI</span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <div className="px-4 py-2">
          <Button asChild variant="outline" className="w-full justify-start gap-2">
            <Link href="/chat">
              <Plus className="h-4 w-4" />
              New Chat
            </Link>
          </Button>
        </div>

        <div className="px-4 py-2">
          <h3 className="mb-2 px-2 text-xs font-semibold text-gray-500">
            Recent Chats
          </h3>
          <ScrollArea className="h-[300px]">
            <div className="space-y-1">
              {conversations?.map((chat) => (
                <Button
                  key={chat.id}
                  asChild
                  variant={pathname === `/chat/${chat.id}` ? 'secondary' : 'ghost'}
                  className="w-full justify-start truncate"
                >
                  <Link href={`/chat/${chat.id}`}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span className="truncate">{chat.title || 'New Conversation'}</span>
                  </Link>
                </Button>
              ))}
              {!conversations?.length && (
                <div className="px-2 text-sm text-gray-500">No recent chats</div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="px-4 py-2">
           <h3 className="mb-2 px-2 text-xs font-semibold text-gray-500">
            Manage
          </h3>
          <nav className="space-y-1">
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/assistants">
                <Bot className="mr-2 h-4 w-4" />
                Assistants
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/knowledge">
                <Database className="mr-2 h-4 w-4" />
                Knowledge Base
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start">
               <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </nav>
        </div>
      </div>

      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 px-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="" />
                <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-xs">
                <span className="font-medium">{user?.name}</span>
                <span className="text-gray-500 truncate w-[140px]">{user?.email}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
