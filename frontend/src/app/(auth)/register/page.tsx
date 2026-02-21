'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

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
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  tenantName: z.string().min(2, 'Organization name is required'),
});

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      tenantName: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await register(values);
      router.push('/chat'); // Redirect to dashboard
    } catch (error) {
      // Error is handled in store
    }
  }

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-indigo-950/20 dark:via-gray-950 dark:to-purple-900/20 flex flex-col justify-center items-center p-4">
      {/* Glow effect backings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none -mt-32 -ml-32" />

      <Card className="w-full max-w-sm border-0 shadow-2xl shadow-indigo-500/10 dark:shadow-purple-900/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl relative overflow-hidden ring-1 ring-black/5 dark:ring-white/10 z-10">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50 dark:via-purple-500" />
        <CardHeader className="space-y-2 pb-6 pt-8 px-8 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-br from-indigo-900 to-purple-800 dark:from-indigo-100 dark:to-purple-300 text-transparent bg-clip-text">Get Started</CardTitle>
          <CardDescription className="text-gray-500 font-medium">
            Create your organization workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
               {/* Full Name */}
               <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Full Name</FormLabel>
                    <FormControl>
                      <Input className="bg-white dark:bg-gray-950 focus-visible:ring-purple-500 transition-shadow" placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               {/* Organization */}
               <FormField
                control={form.control}
                name="tenantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Workspace Name</FormLabel>
                    <FormControl>
                      <Input className="bg-white dark:bg-gray-950 focus-visible:ring-purple-500 transition-shadow" placeholder="Acme Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Email Address</FormLabel>
                    <FormControl>
                      <Input className="bg-white dark:bg-gray-950 focus-visible:ring-purple-500 transition-shadow" placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300">Password</FormLabel>
                    <FormControl>
                      <Input className="bg-white dark:bg-gray-950 focus-visible:ring-purple-500 transition-shadow" type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {authError && (
               <div className="text-sm bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-medium p-3 rounded-md border border-red-200 dark:border-red-900/50 mt-4">
                 {authError}
               </div>
            )}
            
            <Button className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-purple-500/20 transition-all font-semibold rounded-lg mt-6" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center pb-8 pt-4 px-8 border-t border-gray-100 dark:border-gray-800/50 mt-4 bg-gray-50/50 dark:bg-gray-900/20">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 hover:underline transition-colors font-semibold">
            Sign in here
          </Link>
        </p>
      </CardFooter>
    </Card>
    </div>
  );
}
