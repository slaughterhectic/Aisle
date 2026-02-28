'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2, Moon, Sun, ShieldCheck, Sparkles, CheckCircle2, Building } from 'lucide-react';
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
import api from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const requestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  message: z.string().optional(),
  tenantId: z.string().optional(),
  newTenantName: z.string().optional(),
});

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const requestAccess = useAuthStore((state) => state.requestAccess);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  const setError = useAuthStore((state) => state.setError);

  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'login' | 'request'>('login');
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
  const [tenantChoice, setTenantChoice] = useState<'existing' | 'new'>('existing');

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const requestForm = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: { name: '', email: '', message: '', tenantId: '', newTenantName: '' },
  });

  useEffect(() => {
    if (activeTab === 'request') {
      api.get('/auth/tenants')
        .then((res) => setTenants(res.data || []))
        .catch(() => { });
    }
  }, [activeTab]);

  useEffect(() => {
    setError(null);
    setRequestSuccess(null);
  }, [activeTab, setError]);

  async function onLogin(values: z.infer<typeof loginSchema>) {
    try {
      await login(values);
      const loggedInUser = useAuthStore.getState().user;
      if (loggedInUser?.role === 'super_admin') {
        router.push('/super-admin');
      } else {
        router.push('/chat');
      }
    } catch { }
  }

  async function onRequestAccess(values: z.infer<typeof requestSchema>) {
    try {
      const payload: any = { name: values.name, email: values.email };
      if (values.message) payload.message = values.message;
      if (tenantChoice === 'existing' && values.tenantId) {
        payload.tenantId = values.tenantId;
      } else if (tenantChoice === 'new' && values.newTenantName) {
        payload.newTenantName = values.newTenantName;
      }
      const msg = await requestAccess(payload);
      setRequestSuccess(msg);
      requestForm.reset();
    } catch { }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="fixed top-6 right-6 z-50 p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shadow-sm transition-all hover:shadow-md cursor-pointer"
      >
        <Sun className="h-4 w-4 hidden dark:block" />
        <Moon className="h-4 w-4 block dark:hidden" />
      </button>

      {/* Left Branding Panel */}
      <div className="hidden lg:flex w-[45%] xl:w-[50%] bg-slate-50 dark:bg-slate-900/40 border-r border-slate-200 dark:border-slate-800 flex-col justify-between p-12 xl:p-16 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="font-bold text-2xl tracking-tight">Multi Tenant Chat</span>
        </div>

        <div className="relative z-10 w-full max-w-xl">
          <h1 className="text-4xl xl:text-5xl font-semibold tracking-tight leading-tight mb-8">
            The secure platform{' '}
            <span className="text-slate-500 dark:text-slate-400 block mt-2">
              for enterprise intelligence.
            </span>
          </h1>
          <div className="space-y-5 text-slate-600 dark:text-slate-400 mt-12 text-lg">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
              <span>Secure tenant-isolated environments</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
              <span>Advanced internal knowledge bases</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
              <span>Role-based access controls</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} Multi Tenant Chat.
        </div>
      </div>

      {/* Right Auth Panel */}
      <div className="flex-1 w-full lg:w-[55%] xl:w-[50%] flex items-center justify-center p-6 sm:p-12 overflow-y-auto min-h-screen">
        <div className="w-full max-w-[440px] space-y-8 relative z-10 py-12 lg:py-0">

          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="font-bold text-2xl tracking-tight">Multi Tenant Chat</span>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight">{activeTab === 'login' ? 'Welcome back' : 'Register / Request'}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {activeTab === 'login' ? 'Sign in to your enterprise account' : 'Join an existing workspace or create a new one'}
            </p>
          </div>

          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'login'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('request')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'request'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Register
            </button>
          </div>

          <div className="mt-8">
            {activeTab === 'login' ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Email</FormLabel>
                        <FormControl>
                          <Input
                            className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-lg placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-400 focus-visible:border-slate-900 dark:focus-visible:border-slate-400"
                            placeholder="name@company.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-lg placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-400 focus-visible:border-slate-900 dark:focus-visible:border-slate-400"
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
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-4 py-3 rounded-lg border border-red-100 dark:border-red-900/50">
                      {authError}
                    </div>
                  )}

                  <Button
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium rounded-lg transition-all"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sign In
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="animate-in fade-in duration-300">
                {requestSuccess ? (
                  <div className="text-center space-y-4 py-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex justify-center">
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-medium tracking-tight">Request Submitted</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm px-6">
                      {requestSuccess}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => { setRequestSuccess(null); setActiveTab('login'); }}
                      className="mt-4"
                    >
                      Back to Login
                    </Button>
                  </div>
                ) : (
                  <Form {...requestForm}>
                    <form onSubmit={requestForm.handleSubmit(onRequestAccess)} className="space-y-6">
                      <FormField
                        control={requestForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input
                                className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-lg focus-visible:ring-1 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-400 focus-visible:border-slate-900 dark:focus-visible:border-slate-400"
                                placeholder="Jane Doe"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={requestForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work Email</FormLabel>
                            <FormControl>
                              <Input
                                className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-lg focus-visible:ring-1 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-400 focus-visible:border-slate-900 dark:focus-visible:border-slate-400"
                                placeholder="jane@company.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <label className="text-sm font-medium leading-none">
                          Workspace Options
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <div
                            onClick={() => setTenantChoice('existing')}
                            className={`cursor-pointer border rounded-xl p-4 transition-all ${tenantChoice === 'existing'
                                ? 'border-slate-900 dark:border-slate-400 bg-slate-50 dark:bg-slate-900/50 ring-1 ring-slate-900 dark:ring-slate-400'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                              }`}
                          >
                            <Building className="h-5 w-5 mb-2 text-slate-700 dark:text-slate-300" />
                            <div className="font-medium text-sm">Join Existing</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Request to join your team</div>
                          </div>
                          <div
                            onClick={() => setTenantChoice('new')}
                            className={`cursor-pointer border rounded-xl p-4 transition-all ${tenantChoice === 'new'
                                ? 'border-slate-900 dark:border-slate-400 bg-slate-50 dark:bg-slate-900/50 ring-1 ring-slate-900 dark:ring-slate-400'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                              }`}
                          >
                            <Sparkles className="h-5 w-5 mb-2 text-slate-700 dark:text-slate-300" />
                            <div className="font-medium text-sm">Create New</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Setup a new workspace</div>
                          </div>
                        </div>

                        <div className="pt-2">
                          {tenantChoice === 'existing' ? (
                            <FormField
                              control={requestForm.control}
                              name="tenantId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <select
                                      {...field}
                                      className="flex h-12 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-400 focus-visible:border-slate-900 dark:focus-visible:border-slate-400"
                                    >
                                      <option value="">Select workplace...</option>
                                      {tenants.map((t) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                      ))}
                                    </select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ) : (
                            <FormField
                              control={requestForm.control}
                              name="newTenantName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-lg focus-visible:ring-1 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-400 focus-visible:border-slate-900 dark:focus-visible:border-slate-400"
                                      placeholder="Workspace Name"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      </div>

                      <FormField
                        control={requestForm.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message <span className="text-slate-400 font-normal">(optional)</span></FormLabel>
                            <FormControl>
                              <textarea
                                {...field}
                                rows={2}
                                className="flex w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-2.5 text-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-400 focus-visible:border-slate-900 dark:focus-visible:border-slate-400 resize-none"
                                placeholder="Why do you need access?"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {authError && (
                        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-4 py-3 rounded-lg border border-red-100 dark:border-red-900/50">
                          {authError}
                        </div>
                      )}

                      <Button
                        className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium rounded-lg transition-all"
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Submit Form
                      </Button>
                    </form>
                  </Form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

