'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Moon, Sun, ShieldCheck } from 'lucide-react';
import { useTheme } from 'next-themes';

import { useAuthStore } from '@/store/use-auth-store';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  
  const { theme, setTheme } = useTheme();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await login(values);
      router.push('/chat'); // Redirect to dashboard
    } catch (error) {
      // Error is handled in store
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-[#0A0A0B] text-slate-900 dark:text-slate-50">
      {/* Theme Toggle Button Fixed Top Right */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="fixed top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors z-50"
      >
        <Sun className="h-5 w-5 hidden dark:block" />
        <Moon className="h-5 w-5 block dark:hidden" />
      </button>

      {/* Left side: Branding / Immersive Visual */}
      <div className="hidden md:flex flex-1 flex-col justify-between p-12 bg-slate-50 dark:bg-slate-950/50 border-r border-slate-100 dark:border-slate-900 relative overflow-hidden">
        {/* Abstract Background Patterns */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 font-bold text-2xl tracking-tight mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            Aisle AI
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Enterprise Intelligence Platform</p>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <h2 className="text-4xl font-semibold tracking-tight leading-tight">
            Accelerate <br/>your team's workflow.
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400">
            Securely access intelligent assistants, query company knowledge bases, and leverage powerful LLMs within your isolated organizational tenant context.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-sm font-medium text-slate-400 dark:text-slate-600">
            © {new Date().getFullYear()} Aisle AI. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-12 md:px-24">
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center gap-2 mb-12 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          Aisle AI
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter your email address and password to access your secure tenant environment.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Work Email</FormLabel>
                    <FormControl>
                      <Input 
                        className="h-11 bg-white dark:bg-[#0A0A0B] border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500/30 rounded-lg shadow-sm" 
                        placeholder="you@company.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Password</FormLabel>
                    </div>
                    <FormControl>
                      <Input 
                        className="h-11 bg-white dark:bg-[#0A0A0B] border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500/30 rounded-lg shadow-sm" 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {authError && (
                <div className="text-sm bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-medium p-3 rounded-lg border border-red-100 dark:border-red-900/30 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {authError}
                </div>
              )}
              
              <Button 
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 dark:text-slate-900 text-white font-medium rounded-lg transition-all" 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in to your account
              </Button>
            </form>
          </Form>

          <p className="px-8 text-center text-xs text-slate-500 dark:text-slate-500 pt-6">
            By clicking continue, you agree to our Terms of Service and Privacy Policy. Platform access is restricted to authorized personnel.
          </p>
        </div>
      </div>
    </div>
  );
}
