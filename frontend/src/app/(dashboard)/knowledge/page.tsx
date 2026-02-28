'use client';

import { useState, useRef, useCallback } from 'react';
import useSWR from 'swr';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Upload,
  FileText,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  Download,
  ExternalLink,
} from 'lucide-react';

interface Document {
  id: string;
  assistantId: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  status: string;
  chunkCount: number;
  characterCount: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface Assistant {
  id: string;
  name: string;
}

const fetcher = (url: string) => api.get(url).then((r: any) => r.data);

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
    completed: {
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: 'Processed',
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
    processing: {
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      label: 'Processing',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    },
    pending: {
      icon: <Clock className="h-3 w-3" />,
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    failed: {
      icon: <AlertCircle className="h-3 w-3" />,
      label: 'Failed',
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    },
  };

  const s = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${s.className}`}>
      {s.icon} {s.label}
    </span>
  );
}

export default function KnowledgePage() {
  const { data: documents, error, mutate } = useSWR<Document[]>('/knowledge', fetcher);
  const { data: assistants } = useSWR<Assistant[]>('/assistants', fetcher);
  const [uploading, setUploading] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const assistantId = selectedAssistant || assistants?.[0]?.id;
      if (!assistantId) {
        alert('Please create an assistant first before uploading documents.');
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('assistantId', assistantId);

        await api.post('/knowledge/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        mutate();
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Upload failed';
        alert(msg);
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [selectedAssistant, assistants, mutate],
  );

  const handleView = async (doc: Document) => {
    try {
      const response = await api.get(`/knowledge/${doc.id}/content`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: doc.mimeType });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to view document');
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await api.get(`/knowledge/${doc.id}/content?download=true`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: doc.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to download document');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    setDeleting(id);
    try {
      await api.delete(`/knowledge/${id}`);
      mutate();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Knowledge Base</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload documents to power your AI assistants with private knowledge.
          </p>
        </div>
      </div>

      {/* Upload Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Upload Document</CardTitle>
          <CardDescription>
            Supported formats: PDF, DOCX, TXT (max 50 MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {assistants && assistants.length > 1 && (
              <select
                value={selectedAssistant}
                onChange={(e) => setSelectedAssistant(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select assistant...</option>
                {assistants.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            )}
            <div className="flex-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {uploading ? 'Uploading...' : 'Choose File & Upload'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      {error && (
        <div className="text-center text-red-500 py-8">
          Failed to load documents. Please try refreshing.
        </div>
      )}

      {!documents && !error && (
        <div className="text-center py-8">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {documents && documents.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Database className="mx-auto h-12 w-12 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">No documents yet</h3>
          <p className="text-sm mt-1">Upload your first document to get started with RAG.</p>
        </div>
      )}

      {documents && documents.length > 0 && (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-4 p-4 rounded-lg border bg-white dark:bg-gray-900 dark:border-gray-800 hover:shadow-sm transition-shadow"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                  {doc.filename}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatFileSize(doc.fileSize)} • {doc.chunkCount} chunks •{' '}
                  {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={doc.status} />

              <div className="flex items-center ml-4 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-blue-600"
                  title="View Document"
                  onClick={() => handleView(doc)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-blue-600"
                  title="Download Document"
                  onClick={() => handleDownload(doc)}
                >
                  <Download className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-red-600"
                  title="Delete Document"
                  onClick={() => handleDelete(doc.id)}
                  disabled={deleting === doc.id}
                >
                  {deleting === doc.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
