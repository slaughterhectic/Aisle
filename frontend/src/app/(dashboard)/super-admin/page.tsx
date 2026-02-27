'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/use-auth-store';
import { UserRole, AccessRequest } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert, Users, Building2, Plus, ArrowRight, Clock, UserCheck, UserX, Mail, MessageSquare, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function SuperAdminPage() {
  const { user, token } = useAuthStore();
  const [tenants, setTenants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'users' | 'tenants' | 'requests'>('users');
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.ADMIN,
    tenantId: 'new',
    newTenantName: '',
    newTenantSlug: '',
  });

  const [tenantForm, setTenantForm] = useState({
    name: '',
    slug: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tenantsRes, usersRes, requestsRes] = await Promise.all([
        api.get('/super-admin/tenants'),
        api.get('/super-admin/users'),
        api.get('/super-admin/access-requests'),
      ]);

      if (tenantsRes.data) setTenants(tenantsRes.data);
      if (usersRes.data) setUsers(usersRes.data);
      if (requestsRes.data) setRequests(requestsRes.data);
    } catch (error) {
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === UserRole.SUPER_ADMIN) {
      fetchData();
    }
  }, [user, token]);

  if (user?.role !== UserRole.SUPER_ADMIN) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center p-8 text-center delay-500 animate-in fade-in">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4 opacity-80" />
        <h2 className="text-xl font-semibold">Access Restricted</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">
          You do not have the required permissions to view this dashboard. Please contact system administration.
        </p>
      </div>
    );
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
      };

      if (userForm.tenantId === 'new') {
        payload.newTenantName = userForm.newTenantName;
        payload.newTenantSlug = userForm.newTenantSlug;
      } else {
        payload.tenantId = userForm.tenantId;
      }

      const res = await api.post('/super-admin/users', payload);

      if (res.status === 200 || res.status === 201) {
        alert('User created successfully');
        setUserForm({ name: '', email: '', password: '', role: UserRole.ADMIN, tenantId: 'new', newTenantName: '', newTenantSlug: '' });
        fetchData();
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/super-admin/tenants', tenantForm);

      if (res.status === 200 || res.status === 201) {
        alert('Tenant created successfully');
        setTenantForm({ name: '', slug: '' });
        fetchData();
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const handleApproveRequest = async (id: string) => {
    setProcessing(id);
    setSuccessMsg(null);
    try {
      const res = await api.post(`/super-admin/access-requests/${id}/approve`, {});
      setSuccessMsg(res.data?.message || 'Request approved');
      fetchData();
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
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                <ShieldAlert className="h-5 w-5" />
                <span className="font-semibold text-sm tracking-wider uppercase">System Control</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Super Administration</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
                Manage global platform access, configure top-level organizational tenants, and provision administrative users across the entire ecosystem.
              </p>
            </div>
          </div>

          {/* Custom Tabs */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
            <button 
              className={`flex items-center gap-2 pb-3 px-2 font-medium transition-all ${activeTab === 'users' ? 'border-b-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              onClick={() => setActiveTab('users')}
            >
              <Users className="h-4 w-4" />
              Users Management
            </button>
            <button 
              className={`flex items-center gap-2 pb-3 px-2 font-medium transition-all ${activeTab === 'tenants' ? 'border-b-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              onClick={() => setActiveTab('tenants')}
            >
              <Building2 className="h-4 w-4" />
              Organizational Tenants
            </button>
            <button 
              className={`flex items-center gap-2 pb-3 px-2 font-medium transition-all ${activeTab === 'requests' ? 'border-b-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              onClick={() => setActiveTab('requests')}
            >
              <Clock className="h-4 w-4" />
              Access Requests
              {requests.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                  {requests.length}
                </span>
              )}
            </button>
          </div>

          <div className="w-full">
            {/* ─── Users Tab ─────────────────────────────────── */}
            {activeTab === 'users' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="xl:col-span-1 space-y-6">
                  <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Plus className="h-4 w-4 text-indigo-500" />
                        Provision Admin
                      </CardTitle>
                      <CardDescription>Add a new admin and map them to a tenant zone.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                <form onSubmit={handleCreateUser} className="space-y-5">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Full Name</Label>
                      <Input required value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} placeholder="Jane Doe" className="bg-white dark:bg-slate-950" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Email Address</Label>
                      <Input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} placeholder="jane@org.com" className="bg-white dark:bg-slate-950" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Temporary Password</Label>
                      <Input required type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="bg-white dark:bg-slate-950" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Access Role</Label>
                      <select 
                        value={userForm.role}
                        onChange={(e: any) => setUserForm({...userForm, role: e.target.value as UserRole})}
                        className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                      >
                        <option value={UserRole.ADMIN}>Tenant Admin (Full Access)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-lg space-y-4 mt-6">
                    <Label className="text-xs font-semibold text-slate-500 tracking-wider uppercase text-indigo-600 dark:text-indigo-400 mb-2 block">Organization Link</Label>
                    <select
                      value={userForm.tenantId}
                      onChange={(e) => setUserForm({...userForm, tenantId: e.target.value})}
                      className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                    >
                      <option value="new">+ Provision New Tenant</option>
                      {tenants.map(t => (
                        <option key={t.id} value={t.id}>{t.name} (ID: {t.slug})</option>
                      ))}
                    </select>

                    {userForm.tenantId === 'new' && (
                      <div className="grid grid-cols-1 gap-4 pt-3 mt-3 border-t border-slate-200 dark:border-slate-800">
                        <div className="space-y-2">
                          <Label className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">New Tenant Name</Label>
                          <Input required value={userForm.newTenantName} onChange={e => setUserForm({...userForm, newTenantName: e.target.value})} placeholder="Acme Corporation" className="bg-white dark:bg-slate-950 h-9" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">URL Slug</Label>
                          <Input required value={userForm.newTenantSlug} onChange={e => setUserForm({...userForm, newTenantSlug: e.target.value})} placeholder="acme" className="bg-white dark:bg-slate-950 h-9" />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20">
                    <Plus className="h-4 w-4 mr-2" />
                    Provision Admin
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Table Column */}
          <div className="xl:col-span-2">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full flex flex-col">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-500" />
                  Active Users Directory
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-semibold">User</th>
                      <th className="px-6 py-4 font-semibold">Access Level</th>
                      <th className="px-6 py-4 font-semibold">Tenant Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</div>
                          <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{u.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${
                            u.role === UserRole.SUPER_ADMIN ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' :
                            u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Building2 className="h-3.5 w-3.5 text-slate-400" />
                            {u.tenant?.name || 'Unknown'}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-slate-400">No users provisioned yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
        )}

        {/* ─── Tenants Tab ───────────────────────────────── */}
        {activeTab === 'tenants' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-1 space-y-6">
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-500" />
                    Register Tenant
                  </CardTitle>
                  <CardDescription>Manually create a disconnected organization top-level node.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleCreateTenant} className="space-y-5">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Organization Name</Label>
                        <Input required value={tenantForm.name} onChange={e => setTenantForm({...tenantForm, name: e.target.value})} placeholder="Acme Corporation" className="bg-white dark:bg-slate-950" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Unique SLUG URL</Label>
                        <Input required value={tenantForm.slug} onChange={e => setTenantForm({...tenantForm, slug: e.target.value})} placeholder="acme" className="bg-white dark:bg-slate-950" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Register Organization
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="xl:col-span-2">
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full flex flex-col">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-500" />
                    Tenant Organizations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Tenant ID</th>
                        <th className="px-6 py-4 font-semibold">Slug Identifier</th>
                        <th className="px-6 py-4 font-semibold text-right">Registered On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {tenants.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{t.name}</td>
                          <td className="px-6 py-4">
                            <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400 font-mono text-xs">
                              {t.slug}
                            </code>
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-right">
                            {new Date(t.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                        </tr>
                      ))}
                      {tenants.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center text-slate-400">No organizations found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ─── Access Requests Tab ────────────────────────── */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Success Banner */}
            {successMsg && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 text-sm text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2">
                <UserCheck className="h-4 w-4 shrink-0" />
                {successMsg}
              </div>
            )}

            {requests.length === 0 ? (
              <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="py-16 text-center">
                  <Clock className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">No Pending Requests</h3>
                  <p className="text-sm text-slate-400 mt-1">All access requests have been reviewed.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <Card key={req.id} className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                              {req.name[0]?.toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white">{req.name}</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {req.email}
                              </p>
                            </div>
                          </div>
                          {req.tenantName && (
                            <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1 ml-[52px]">
                              <Building2 className="h-3.5 w-3.5 text-slate-400" /> Wants to join: <span className="font-medium">{req.tenantName}</span>
                            </p>
                          )}
                          {req.newTenantName && (
                            <p className="text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-1 ml-[52px]">
                              <Building2 className="h-3.5 w-3.5" /> New org requested: <span className="font-semibold">{req.newTenantName}</span>
                              <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-medium ml-1">will create ADMIN</span>
                            </p>
                          )}
                          {req.message && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-start gap-1 ml-[52px]">
                              <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {req.message}
                            </p>
                          )}
                          <p className="text-xs text-slate-400 ml-[52px]">
                            Submitted {new Date(req.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        <div className="flex gap-2 ml-[52px] md:ml-0">
                          <Button
                            size="sm"
                            onClick={() => handleApproveRequest(req.id)}
                            disabled={processing === req.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          >
                            {processing === req.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <UserCheck className="h-4 w-4 mr-1" />}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectRequest(req.id)}
                            disabled={processing === req.id}
                            className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Reject
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
    </div>
  );
}
