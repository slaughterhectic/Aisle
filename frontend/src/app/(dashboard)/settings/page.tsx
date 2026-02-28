'use client';

import { useState, useRef } from 'react';
import useSWR from 'swr';
import { useAuthStore } from '@/store/use-auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, User, Building2, Upload, Loader2, Camera, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { UserRole, TenantInfo } from '@/types';

const fetcher = (url: string) => api.get(url).then((r: any) => r.data);

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;

  const { data: tenantInfo, mutate: mutateTenant } = useSWR<TenantInfo>(
    user ? '/tenant/info' : null,
    fetcher,
  );

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadSuccess(false);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      await api.post('/tenant/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      mutateTenant();
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const logoSrc = tenantInfo?.logoUrl
    ? `${api.defaults.baseURL}/tenant/logo/${tenantInfo.id}`
    : null;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-500">Name</span>
              <span className="text-sm font-medium">{user?.name || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-500">Email</span>
              <span className="text-sm font-medium">{user?.email || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-500">Role</span>
              <span className="text-sm font-medium capitalize">{user?.role || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500">Organization</span>
              <div className="flex items-center gap-2">
                {logoSrc && (
                  <img
                    src={logoSrc}
                    alt="Org logo"
                    className="h-5 w-5 rounded-sm object-cover"
                  />
                )}
                <span className="text-sm font-medium">{tenantInfo?.name || '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Card (Admin Only) */}
        {isAdmin && (
          <Card className="border-indigo-200 dark:border-indigo-900/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Building2 className="h-5 w-5" /> Organization
              </CardTitle>
              <CardDescription>
                Manage your organization's branding. The logo will be visible to all team members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Logo Preview */}
                <div className="relative group">
                  <div className="h-24 w-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors group-hover:border-indigo-400 dark:group-hover:border-indigo-600">
                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt="Organization logo"
                        className="h-full w-full object-cover rounded-xl"
                      />
                    ) : (
                      <Building2 className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                  {/* Overlay on hover */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl cursor-pointer"
                  >
                    <Camera className="h-6 w-6 text-white" />
                  </button>
                </div>

                {/* Upload Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {tenantInfo?.name || 'Your Organization'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Upload your organization logo. Supports PNG, JPEG, WebP (max 5MB).
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="text-xs"
                    >
                      {uploading ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      {uploading ? 'Uploading...' : 'Upload Logo'}
                    </Button>
                    {uploadSuccess && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Saved!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sign Out Card */}
        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-red-600">
              <LogOut className="h-5 w-5" /> Sign Out
            </CardTitle>
            <CardDescription>
              Sign out of your account. You can sign back in at any time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
