'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useAuthStore } from '@/store/use-auth-store';
import { UserRole, AccessRequest } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ShieldAlert, Users, Building2, Plus, ArrowRight, Clock, UserCheck, UserX,
  Mail, MessageSquare, Loader2, Activity, Globe, Shield, Hash
} from 'lucide-react';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r: any) => r.data);

export default function SuperAdminPage() {
  const { user } = useAuthStore();

  // SWR for real-time data
  const { data: tenants = [], mutate: mutateTenants } = useSWR(
    user?.role === UserRole.SUPER_ADMIN ? '/super-admin/tenants' : null,
    fetcher,
    { refreshInterval: 5000 }
  );
  const { data: users = [], mutate: mutateUsers } = useSWR(
    user?.role === UserRole.SUPER_ADMIN ? '/super-admin/users' : null,
    fetcher,
    { refreshInterval: 5000 }
  );
  const { data: requests = [], mutate: mutateRequests } = useSWR<AccessRequest[]>(
    user?.role === UserRole.SUPER_ADMIN ? '/super-admin/access-requests' : null,
    fetcher,
    { refreshInterval: 3000 } // Faster polling for access requests
  );

  const [processing, setProcessing] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'tenants' | 'requests'>('users');

  const [userForm, setUserForm] = useState({
    name: '', email: '', password: '', role: UserRole.ADMIN,
    tenantId: 'new', newTenantName: '', newTenantSlug: '',
  });
  const [tenantForm, setTenantForm] = useState({ name: '', slug: '' });

  if (user?.role !== UserRole.SUPER_ADMIN) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center p-8 text-center animate-in fade-in">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4 opacity-80" />
        <h2 className="text-xl font-semibold">Access Restricted</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">
          You do not have the required permissions to view this dashboard.
        </p>
      </div>
    );
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: userForm.name, email: userForm.email,
        password: userForm.password, role: userForm.role,
      };
      if (userForm.tenantId === 'new') {
        payload.newTenantName = userForm.newTenantName;
        payload.newTenantSlug = userForm.newTenantSlug;
      } else {
        payload.tenantId = userForm.tenantId;
      }
      await api.post('/super-admin/users', payload);
      setSuccessMsg('Admin provisioned successfully');
      setUserForm({ name: '', email: '', password: '', role: UserRole.ADMIN, tenantId: 'new', newTenantName: '', newTenantSlug: '' });
      mutateTenants(); mutateUsers();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/super-admin/tenants', tenantForm);
      setSuccessMsg('Organization registered successfully');
      setTenantForm({ name: '', slug: '' });
      mutateTenants();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const handleApproveRequest = async (id: string) => {
    setProcessing(id);
    try {
      const res = await api.post(`/super-admin/access-requests/${id}/approve`, {});
      setSuccessMsg(res.data?.message || 'Request approved');
      mutateRequests(); mutateUsers(); mutateTenants();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectRequest = async (id: string) => {
    if (!confirm('Are you sure you want to reject this request?')) return;
    setProcessing(id);
    try {
      await api.post(`/super-admin/access-requests/${id}/reject`);
      mutateRequests();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessing(null);
    }
  };

  const pendingRequests = (requests ?? []).filter((r: any) => r.status === 'pending');

  // Stats
  const totalUsers = users.length;
  const totalTenants = tenants.length;
  const totalPending = pendingRequests.length;

  const tabs = [
    { key: 'users' as const, label: 'Users', icon: Users, count: totalUsers },
    { key: 'tenants' as const, label: 'Organizations', icon: Building2, count: totalTenants },
    { key: 'requests' as const, label: 'Access Requests', icon: Clock, count: totalPending, highlight: totalPending > 0 },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
      <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* ── Header ─────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
              <Shield className="h-4 w-4" />
              <span className="font-semibold text-xs tracking-widest uppercase">System Control</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Super Administration
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm max-w-2xl">
              Manage tenants, provision admins, and review access requests across the platform.
            </p>
          </div>

          {/* ── Stats ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalUsers}</p>
                <p className="text-xs text-slate-500">Total Users</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalTenants}</p>
                <p className="text-xs text-slate-500">Organizations</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center gap-4">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${totalPending > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                {totalPending > 0
                  ? <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  : <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                }
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalPending}</p>
                <p className="text-xs text-slate-500">Pending Requests</p>
              </div>
            </div>
          </div>

          {/* ── Success Message ────────────────────────────────────── */}
          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 text-sm text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <UserCheck className="h-4 w-4 shrink-0" />
              {successMsg}
            </div>
          )}

          {/* ── Tabs ───────────────────────────────────────────────── */}
          <div className="flex gap-1 p-1 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl w-fit">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab.key
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`ml-0.5 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[11px] font-bold ${tab.highlight
                      ? 'bg-amber-500 text-white'
                      : activeTab === tab.key
                        ? 'bg-white/20 text-white dark:bg-slate-900/30 dark:text-slate-900'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* ── USERS TAB ──────────────────────────────────────────── */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'users' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Form */}
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm xl:col-span-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Plus className="h-4 w-4 text-indigo-500" /> Provision Admin
                  </CardTitle>
                  <CardDescription className="text-xs">Add a new admin and map them to a tenant.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</Label>
                      <Input required value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} placeholder="e.g. Jane Doe" className="h-9 bg-white dark:bg-slate-950 placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</Label>
                      <Input required type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} placeholder="e.g. jane@org.com" className="h-9 bg-white dark:bg-slate-950 placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</Label>
                      <Input required type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} className="h-9 bg-white dark:bg-slate-950" />
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-lg space-y-3">
                      <Label className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Organization</Label>
                      <select
                        value={userForm.tenantId}
                        onChange={e => setUserForm({ ...userForm, tenantId: e.target.value })}
                        className="flex h-9 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                      >
                        <option value="new">+ Create New Organization</option>
                        {tenants.map((t: any) => (
                          <option key={t.id} value={t.id}>{t.name} ({t.slug})</option>
                        ))}
                      </select>
                      {userForm.tenantId === 'new' && (
                        <div className="grid grid-cols-1 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Org Name</Label>
                            <Input required value={userForm.newTenantName} onChange={e => setUserForm({ ...userForm, newTenantName: e.target.value })} placeholder="e.g. Acme Corp" className="h-8 text-sm bg-white dark:bg-slate-950 placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">URL Slug</Label>
                            <Input required value={userForm.newTenantSlug} onChange={e => setUserForm({ ...userForm, newTenantSlug: e.target.value })} placeholder="e.g. acme" className="h-8 text-sm bg-white dark:bg-slate-950 placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                          </div>
                        </div>
                      )}
                    </div>

                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm h-9 text-sm">
                      <Plus className="h-3.5 w-3.5 mr-1.5" /> Provision Admin
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Table */}
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm xl:col-span-2 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4 text-indigo-500" /> Active Users
                    <span className="text-xs font-normal text-slate-400 ml-1">({totalUsers})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[11px] text-slate-500 uppercase bg-slate-50/80 dark:bg-slate-900/80 border-y border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="px-5 py-3 font-semibold">User</th>
                        <th className="px-5 py-3 font-semibold">Role</th>
                        <th className="px-5 py-3 font-semibold">Organization</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {users.map((u: any) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {u.name?.[0]?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 dark:text-slate-100 text-[13px]">{u.name}</div>
                                <div className="text-slate-400 text-[11px]">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${u.role === UserRole.SUPER_ADMIN ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' :
                                u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400' :
                                  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                              {u.role?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[13px]">
                              <Building2 className="h-3.5 w-3.5 text-slate-400" />
                              {u.tenant?.name || 'Unlinked'}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr><td colSpan={3} className="px-5 py-12 text-center text-slate-400 text-sm">No users provisioned yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* ── TENANTS TAB ────────────────────────────────────────── */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'tenants' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Form */}
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm xl:col-span-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-500" /> Register Organization
                  </CardTitle>
                  <CardDescription className="text-xs">Create a standalone organizational tenant.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTenant} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</Label>
                      <Input required value={tenantForm.name} onChange={e => setTenantForm({ ...tenantForm, name: e.target.value })} placeholder="e.g. Acme Corporation" className="h-9 bg-white dark:bg-slate-950 placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Slug</Label>
                      <Input required value={tenantForm.slug} onChange={e => setTenantForm({ ...tenantForm, slug: e.target.value })} placeholder="e.g. acme" className="h-9 bg-white dark:bg-slate-950 placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                    </div>
                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm h-9 text-sm">
                      <ArrowRight className="h-3.5 w-3.5 mr-1.5" /> Register
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Table */}
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm xl:col-span-2 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4 text-indigo-500" /> Tenant Organizations
                    <span className="text-xs font-normal text-slate-400 ml-1">({totalTenants})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[11px] text-slate-500 uppercase bg-slate-50/80 dark:bg-slate-900/80 border-y border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Organization</th>
                        <th className="px-5 py-3 font-semibold">Slug</th>
                        <th className="px-5 py-3 font-semibold text-right">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {tenants.map((t: any) => (
                        <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              {t.settings?.branding?.logoUrl ? (
                                <img src={`${api.defaults.baseURL}/tenant/logo/${t.id}`} alt={`${t.name} logo`} className="h-9 w-9 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0" />
                              ) : (
                                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 flex items-center justify-center shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                                  <Building2 className="h-4 w-4 text-indigo-400" />
                                </div>
                              )}
                              <span className="font-medium text-slate-900 dark:text-slate-100 text-[13px]">{t.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400 font-mono text-xs">{t.slug}</code>
                          </td>
                          <td className="px-5 py-3 text-slate-400 text-xs text-right">
                            {new Date(t.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                      {tenants.length === 0 && (
                        <tr><td colSpan={3} className="px-5 py-12 text-center text-slate-400 text-sm">No organizations found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* ── ACCESS REQUESTS TAB ────────────────────────────────── */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {/* Live indicator */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live — auto-refreshing every 3 seconds
              </div>

              {pendingRequests.length === 0 ? (
                <Card className="border-slate-200 dark:border-slate-800">
                  <CardContent className="py-16 text-center">
                    <UserCheck className="h-12 w-12 mx-auto text-emerald-300 dark:text-emerald-800 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">All Clear</h3>
                    <p className="text-sm text-slate-400 mt-1">No pending access requests.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req: any) => (
                    <Card key={req.id} className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {req.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="space-y-1.5 min-w-0">
                              <h3 className="font-semibold text-slate-900 dark:text-white text-[15px]">{req.name}</h3>
                              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                <Mail className="h-3 w-3 shrink-0" /> {req.email}
                              </p>
                              {req.tenantName && (
                                <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                  <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                                  Wants to join: <span className="font-medium">{req.tenantName}</span>
                                </p>
                              )}
                              {req.newTenantName && (
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                  <Building2 className="h-3 w-3 shrink-0" />
                                  New org: <span className="font-semibold">{req.newTenantName}</span>
                                  <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-[10px] font-bold uppercase">creates admin</span>
                                </p>
                              )}
                              {req.message && (
                                <p className="text-xs text-slate-400 flex items-start gap-1.5">
                                  <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" /> {req.message}
                                </p>
                              )}
                              <p className="text-[11px] text-slate-400">
                                {new Date(req.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              onClick={() => handleApproveRequest(req.id)}
                              disabled={processing === req.id}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-8 text-xs px-3"
                            >
                              {processing === req.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <UserCheck className="h-3.5 w-3.5 mr-1" />}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectRequest(req.id)}
                              disabled={processing === req.id}
                              className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30 h-8 text-xs px-3"
                            >
                              <UserX className="h-3.5 w-3.5 mr-1" /> Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
