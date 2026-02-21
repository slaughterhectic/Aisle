'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MessageSquare, Plus, Settings, User, LogOut, Database, Bot } from 'lucide-react';
import useSWR from 'swr';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/use-auth-store';
import api from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Conversation {
  id: string;
  title?: string;
  assistantName: string;
}

const fetcher = (url: string) => api.get(url).then((r: any) => r.data);

function ConversationItem({ 
  chat, 
  pathname,
  onRename,
  onDelete
}: { 
  chat: Conversation, 
  pathname: string,
  onRename: (id: string, title: string) => Promise<void>,
  onDelete: (id: string) => Promise<void>
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(chat.title || 'New Conversation');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (editTitle.trim() && editTitle !== chat.title) {
      await onRename(chat.id, editTitle);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(chat.title || 'New Conversation');
    }
  };

  return (
    <div className="group relative pr-8">
      {isEditing ? (
        <form onSubmit={handleSave} className="flex w-full items-center gap-2 px-3 py-1.5" onClick={e => e.stopPropagation()}>
          <MessageSquare className="h-4 w-4 shrink-0 text-purple-500" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-sm font-medium focus:outline-none dark:text-white border-b border-purple-500"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
          />
        </form>
      ) : (
        <Button
          asChild
          variant={pathname === `/chat/${chat.id}` ? 'secondary' : 'ghost'}
          className={cn(
            "w-full justify-start truncate relative pr-2 transition-all",
            pathname === `/chat/${chat.id}` ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium" : "text-slate-600 hover:text-purple-600 hover:bg-purple-50 dark:text-slate-400 dark:hover:bg-purple-900/20"
          )}
        >
          <Link href={`/chat/${chat.id}`}>
            <MessageSquare className={cn("mr-2 h-4 w-4", pathname === `/chat/${chat.id}` ? "text-purple-600 dark:text-purple-400" : "text-current")} />
            <span className="truncate">{chat.title || 'New Conversation'}</span>
          </Link>
        </Button>
      )}

      {/* Hover actions */}
      {!isEditing && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 p-0"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}
            title="Rename"
          >
            <Settings className="h-3 w-3" /> {/* Use settings or a pen icon */}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-0"
            onClick={async (e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                if(confirm("Are you sure you want to delete this chat?")) await onDelete(chat.id); 
            }}
            title="Delete"
          >
            <LogOut className="h-3 w-3 rotate-180" /> {/* Hacky trash icon if Trash not imported */}
          </Button>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { data: conversations, mutate } = useSWR<Conversation[]>('/conversations', fetcher);

  const handleRename = async (id: string, newTitle: string) => {
    try {
      await api.post(`/conversations/${id}/update`, { title: newTitle });
      mutate();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.post(`/conversations/${id}/delete`);
      mutate();
      if (pathname === `/chat/${id}`) {
        router.push('/chat');
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="flex h-full w-[280px] flex-col border-r bg-gray-50/40 dark:bg-gray-900/40">
      <div className="flex h-14 items-center border-b border-purple-100 dark:border-slate-800 px-4">
        <Link href="/chat" className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 hover:text-purple-600 transition-colors">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-1">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="tracking-tight text-lg shadow-sm">Aisle AI</span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <div className="px-4 py-2">
          <Button asChild className="w-full justify-start gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-sm shadow-purple-500/20 border-0">
            <Link href="/chat">
              <Plus className="h-4 w-4" />
              New Chat
            </Link>
          </Button>
        </div>

        <div className="px-4 py-2">
          <h3 className="mb-2 px-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Recent Chats
          </h3>
          <ScrollArea className="h-[300px]">
            <div className="space-y-0.5">
              {conversations?.map((chat) => (
                <ConversationItem 
                  key={chat.id} 
                  chat={chat} 
                  pathname={pathname}
                  onRename={handleRename}
                  onDelete={handleDelete}
                />
              ))}
              {!conversations?.length && (
                <div className="px-3 py-4 text-sm text-slate-500 text-center italic bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                  No recent chats
                </div>
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

      <div className="border-t border-purple-100 dark:border-slate-800 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 px-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
              <Avatar className="h-8 w-8 ring-2 ring-purple-100 dark:ring-purple-900">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium">{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-xs flex-1 min-w-0">
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate w-full shadow-sm">{user?.name}</span>
                <span className="text-slate-500 truncate w-full">{user?.email}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-slate-200 dark:border-slate-800 shadow-xl shadow-purple-900/5">
            <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuItem onClick={() => { logout(); router.push('/login'); }} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
