'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/sidebar';
import { useAuthStore } from '@/store/use-auth-store';
import { useSidebarStore } from '@/store/use-sidebar-store';
import { UserRole } from '@/types';
import { Loader2, PanelLeft, SquarePen, Search, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const { isCollapsed, toggle } = useSidebarStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const token = localStorage.getItem('accessToken');
    if (!token && !isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isClient, isLoading, isAuthenticated, router]);

  if (!isClient || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Expanded Sidebar ───────────────────────────────────── */}
      <div className={cn(
        "hidden md:flex transition-all duration-300 ease-in-out shrink-0 overflow-hidden",
        isCollapsed ? "w-0" : "w-[280px]"
      )}>
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          isCollapsed ? "w-0 opacity-0" : "w-[280px] opacity-100"
        )}>
          <Sidebar />
        </div>
      </div>

      {/* ── Collapsed Icon Strip (ChatGPT-style) ──────────────── */}
      {isCollapsed && (
        <div className="hidden md:flex w-[50px] flex-col items-center pt-4 pb-4 border-r border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 shrink-0">
          {/* Top icons — toggle + new chat + search */}
          <div className="flex flex-col items-center gap-1">
            {/* Open sidebar toggle */}
            <button
              onClick={toggle}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Open sidebar"
            >
              <PanelLeft className="h-[18px] w-[18px]" />
            </button>

            {/* New chat */}
            {!isSuperAdmin && (
              <Link
                href="/chat"
                className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="New chat"
              >
                <SquarePen className="h-[18px] w-[18px]" />
              </Link>
            )}

            {/* Search */}
            {!isSuperAdmin && (
              <button
                onClick={toggle}
                className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Search chats"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>
            )}

            {/* Super admin — dashboard */}
            {isSuperAdmin && (
              <Link
                href="/super-admin"
                className="p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                title="Dashboard"
              >
                <Shield className="h-[18px] w-[18px]" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Main Content ───────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-950">
        {children}
      </main>
    </div>
  );
}
