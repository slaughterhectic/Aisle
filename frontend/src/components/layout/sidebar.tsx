'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Plus, Settings, LogOut, Database, Bot,
  MoreHorizontal, Pencil, Trash2, Pin, Archive,
  Share2, ChevronDown, ChevronRight, PinOff, ArchiveRestore,
  Search, X, Shield, PanelLeftClose,
} from 'lucide-react';
import useSWR from 'swr';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/use-auth-store';
import { UserRole } from '@/types';
import api from '@/lib/api';
import { useSidebarStore } from '@/store/use-sidebar-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Conversation {
  id: string;
  title?: string;
  assistantName: string;
  isPinned?: boolean;
  isArchived?: boolean;
}

const fetcher = (url: string) => api.get(url).then((r: any) => r.data);

// ─── Conversation Item ──────────────────────────────────────────────────
function ConversationItem({
  chat,
  pathname,
  onRename,
  onDelete,
  onPin,
  onArchive,
}: {
  chat: Conversation;
  pathname: string;
  onRename: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onPin: (id: string) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(chat.title || 'New Conversation');
  const [menuOpen, setMenuOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isActive = pathname === `/chat/${chat.id}`;

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== (chat.title || 'New Conversation')) {
      await onRename(chat.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(chat.title || 'New Conversation');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/chat/${chat.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  };

  // ── Inline rename ───────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div className="relative rounded-lg px-1 py-0.5">
        <input
          ref={inputRef}
          className={cn(
            "w-full text-sm font-medium py-1.5 px-2.5 rounded-lg",
            "text-slate-900 dark:text-slate-100",
            "outline-none ring-2 ring-purple-500 dark:ring-purple-400",
            "bg-white dark:bg-slate-800"
          )}
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
        />
      </div>
    );
  }

  // ── Normal state ────────────────────────────────────────────────────
  return (
    <div className="group relative">
      <Link
        href={`/chat/${chat.id}`}
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsEditing(true);
        }}
        className={cn(
          "flex items-center w-full rounded-lg px-2.5 py-2 text-[13px] transition-all duration-150",
          isActive
            ? "bg-purple-100/80 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 font-medium"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
        )}
      >
        {chat.isPinned && (
          <Pin className="h-3 w-3 mr-1.5 shrink-0 text-purple-500 dark:text-purple-400 -rotate-45" />
        )}
        <span className="truncate flex-1">{chat.title || 'New Conversation'}</span>
      </Link>

      {/* Three-dot menu */}
      <div
        className={cn(
          "absolute right-1 top-1/2 -translate-y-1/2 transition-opacity duration-150",
          menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center justify-center h-6 w-6 rounded-md transition-colors",
                "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200",
                "hover:bg-slate-200/80 dark:hover:bg-slate-700/60",
                isActive &&
                "text-purple-500 dark:text-purple-300 hover:text-purple-700 hover:bg-purple-200/60 dark:hover:bg-purple-800/40"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="bottom"
            className="w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-1"
          >
            <DropdownMenuItem
              onClick={() => { setMenuOpen(false); handleShare(); }}
              className="gap-2.5 px-3 py-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[13px]"
            >
              <Share2 className="h-4 w-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => { setMenuOpen(false); setIsEditing(true); }}
              className="gap-2.5 px-3 py-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[13px]"
            >
              <Pencil className="h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => { setMenuOpen(false); await onPin(chat.id); }}
              className="gap-2.5 px-3 py-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[13px]"
            >
              {chat.isPinned ? <><PinOff className="h-4 w-4" /> Unpin chat</> : <><Pin className="h-4 w-4" /> Pin chat</>}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => { setMenuOpen(false); await onArchive(chat.id); }}
              className="gap-2.5 px-3 py-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[13px]"
            >
              {chat.isArchived ? <><ArchiveRestore className="h-4 w-4" /> Unarchive</> : <><Archive className="h-4 w-4" /> Archive</>}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
            <DropdownMenuItem
              onClick={async () => { setMenuOpen(false); if (confirm('Delete this conversation?')) await onDelete(chat.id); }}
              className="gap-2.5 px-3 py-2 cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 focus:text-red-600 rounded-lg text-[13px]"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────
function SectionHeader({
  label,
  collapsible = false,
  isOpen = true,
  onToggle,
  count,
}: {
  label: string;
  collapsible?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={collapsible ? onToggle : undefined}
      className={cn(
        "flex items-center gap-1.5 w-full px-2.5 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest select-none",
        collapsible && "cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      )}
    >
      {collapsible && (
        isOpen
          ? <ChevronDown className="h-3 w-3" />
          : <ChevronRight className="h-3 w-3" />
      )}
      {label}
      {count !== undefined && count > 0 && (
        <span className="ml-auto text-[10px] font-medium bg-slate-200/80 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400 rounded-full px-1.5 py-px leading-none">
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Chat List Section (with independent scroll) ────────────────────────
function ChatSection({
  chats,
  maxHeight,
  itemProps,
}: {
  chats: Conversation[];
  maxHeight: string;
  itemProps: any;
}) {
  if (chats.length === 0) return null;

  return (
    <ScrollArea className={maxHeight}>
      <div className="space-y-px pr-1">
        {chats.map((chat) => (
          <ConversationItem key={chat.id} chat={chat} {...itemProps} />
        ))}
      </div>
    </ScrollArea>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { data: conversations, mutate } = useSWR<Conversation[]>('/conversations', fetcher);
  const { data: tenantInfo } = useSWR(user ? '/tenant/info' : null, fetcher);
  const [archivedOpen, setArchivedOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchFocused, setSearchFocused] = React.useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);

  const logoSrc = tenantInfo?.logoUrl
    ? `${api.defaults.baseURL}/tenant/logo/${tenantInfo.id}`
    : null;

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
      if (pathname === `/chat/${id}`) router.push('/chat');
    } catch (e) { console.error(e); }
  };

  const handlePin = async (id: string) => {
    try {
      await api.post(`/conversations/${id}/pin`);
      mutate();
    } catch (e) { console.error(e); }
  };

  const handleArchive = async (id: string) => {
    try {
      await api.post(`/conversations/${id}/archive`);
      mutate();
    } catch (e) { console.error(e); }
  };

  // Filter by search
  const filtered = React.useMemo(() => {
    if (!conversations) return [];
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) =>
      (c.title || 'New Conversation').toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  // Split into sections
  const pinnedChats = filtered.filter((c) => c.isPinned && !c.isArchived);
  const recentChats = filtered.filter((c) => !c.isPinned && !c.isArchived);
  const archivedChats = filtered.filter((c) => c.isArchived);

  const itemProps = {
    pathname,
    onRename: handleRename,
    onDelete: handleDelete,
    onPin: handlePin,
    onArchive: handleArchive,
  };

  return (
    <div className="flex h-full w-[280px] flex-col border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200/60 dark:border-slate-800 px-4">
        <Link
          href={user?.role === UserRole.SUPER_ADMIN ? '/super-admin' : '/chat'}
          className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 hover:text-purple-600 transition-colors min-w-0"
        >
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="Org logo"
              className="h-8 w-8 rounded-lg object-cover shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
            />
          ) : (
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-1.5 shadow-sm shadow-purple-500/20 shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
          )}
          <span className="tracking-tight text-[15px] font-semibold truncate">
            {tenantInfo?.name || 'Multi Tenant Chat'}
          </span>
        </Link>
        <button
          onClick={() => useSidebarStore.getState().toggle()}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          title="Collapse sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col">

        {/* Chat UI — hidden for super_admin */}
        {user?.role !== UserRole.SUPER_ADMIN && (
          <>
            {/* New Chat + Search */}
            <div className="px-3 pt-3 pb-1 space-y-2">
              <Button
                asChild
                className="w-full justify-start gap-2 h-9 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-sm shadow-purple-500/20 border-0 text-[13px] font-medium rounded-lg"
              >
                <Link href="/chat">
                  <Plus className="h-4 w-4" />
                  New Chat
                </Link>
              </Button>

              {/* Search Bar */}
              <div className={cn(
                "relative flex items-center rounded-lg border transition-all duration-200",
                searchFocused
                  ? "border-purple-400 dark:border-purple-500 ring-1 ring-purple-400/30 bg-white dark:bg-slate-900"
                  : "border-slate-200 dark:border-slate-700/80 bg-slate-100/80 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-600"
              )}>
                <Search className="h-3.5 w-3.5 ml-2.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="flex-1 bg-transparent text-[13px] py-1.5 px-2 outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
                    className="mr-1.5 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* ── Chat Sections ─────────────────────────────────────── */}
            <div className="flex-1 overflow-hidden flex flex-col px-2 pt-2 gap-1">

              {/* Pinned */}
              {pinnedChats.length > 0 && (
                <div className="shrink-0 flex flex-col">
                  <SectionHeader label="Pinned" count={pinnedChats.length} />
                  <ChatSection chats={pinnedChats} maxHeight="max-h-[140px]" itemProps={itemProps} />
                </div>
              )}

              {/* Recent Chats — takes remaining space */}
              <div className="flex-1 min-h-0 flex flex-col">
                <SectionHeader label="Recent Chats" count={recentChats.length > 0 ? recentChats.length : undefined} />
                {recentChats.length > 0 ? (
                  <ScrollArea className="flex-1">
                    <div className="space-y-px pr-1">
                      {recentChats.map((chat) => (
                        <ConversationItem key={chat.id} chat={chat} {...itemProps} />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="px-3 py-3 text-[12px] text-slate-400 dark:text-slate-500 text-center italic">
                    {searchQuery ? 'No matches found' : 'No recent chats'}
                  </div>
                )}
              </div>

              {/* Archived (collapsible) */}
              {archivedChats.length > 0 && (
                <div className="shrink-0 flex flex-col border-t border-slate-200/60 dark:border-slate-800 pt-1">
                  <SectionHeader
                    label="Archived"
                    collapsible
                    isOpen={archivedOpen}
                    onToggle={() => setArchivedOpen(!archivedOpen)}
                    count={archivedChats.length}
                  />
                  {archivedOpen && (
                    <ChatSection chats={archivedChats} maxHeight="max-h-[160px]" itemProps={itemProps} />
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Super Admin Overview — shown only for super_admin */}
        {user?.role === UserRole.SUPER_ADMIN && (
          <div className="flex-1 flex flex-col px-3 pt-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-1.5">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">System Control</p>
                <p className="text-[11px] text-slate-400">Platform Administration</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Button asChild variant="ghost" className="w-full justify-start h-9 text-[13px] text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-200 rounded-lg bg-purple-50 dark:bg-purple-900/10">
                <Link href="/super-admin">
                  <Shield className="mr-2 h-3.5 w-3.5" />
                  Dashboard
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start h-9 text-[13px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg">
                <Link href="/settings">
                  <Settings className="mr-2 h-3.5 w-3.5" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* ── Manage Section (non-super_admin) ─────────────────────── */}
        {user?.role !== UserRole.SUPER_ADMIN && (
          <div className="px-3 py-2 border-t border-slate-200/60 dark:border-slate-800">
            <SectionHeader label="Manage" />
            <nav className="space-y-px mt-0.5">
              {user?.role === UserRole.ADMIN && (
                <Button asChild variant="ghost" className="w-full justify-start h-8 text-[13px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg">
                  <Link href="/assistants">
                    <Bot className="mr-2 h-3.5 w-3.5" />
                    Assistants
                  </Link>
                </Button>
              )}
              {user?.role === UserRole.ADMIN && (
                <Button asChild variant="ghost" className="w-full justify-start h-8 text-[13px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg">
                  <Link href="/knowledge">
                    <Database className="mr-2 h-3.5 w-3.5" />
                    Knowledge Base
                  </Link>
                </Button>
              )}
              {user?.role === UserRole.ADMIN && (
                <Button asChild variant="ghost" className="w-full justify-start h-8 text-[13px] text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 rounded-lg bg-amber-50/60 dark:bg-amber-900/10">
                  <Link href="/admin/requests">
                    <Shield className="mr-2 h-3.5 w-3.5" />
                    Access Requests
                  </Link>
                </Button>
              )}
              <Button asChild variant="ghost" className="w-full justify-start h-8 text-[13px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg">
                <Link href="/settings">
                  <Settings className="mr-2 h-3.5 w-3.5" />
                  Settings
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </div>

      {/* ── User Profile ──────────────────────────────────────────── */}
      <div className="border-t border-slate-200/60 dark:border-slate-800 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2.5 px-2 h-10 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors rounded-lg"
            >
              <Avatar className="h-7 w-7 ring-1.5 ring-purple-200/60 dark:ring-purple-800/60">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-medium">
                  {user?.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-xs flex-1 min-w-0">
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate w-full text-[12px]">
                  {user?.name}
                </span>
                <span className="text-slate-400 dark:text-slate-500 truncate w-full text-[11px]">
                  {user?.email}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border-slate-200 dark:border-slate-800 shadow-xl rounded-xl"
          >
            <DropdownMenuLabel className="font-semibold text-[13px]">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuItem
              onClick={() => { logout(); router.push('/login'); }}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer text-[13px] rounded-lg"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
