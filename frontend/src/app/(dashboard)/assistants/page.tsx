'use client';

import { useState } from 'react';
import useSWR from 'swr';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Bot,
  Plus,
  Trash2,
  Loader2,
  Settings2,
  MessageSquare,
  X,
} from 'lucide-react';

interface Assistant {
  id: string;
  name: string;
  description: string | null;
  systemPrompt: string;
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  ragEnabled: boolean;
  ragTopK: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const fetcher = (url: string) => api.get(url).then((r: any) => r.data);

export default function AssistantsPage() {
  const { data: assistants, error, mutate } = useSWR<Assistant[]>('/assistants', fetcher);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Create form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a helpful AI assistant. Answer questions accurately and cite sources when available.',
  );
  const [provider, setProvider] = useState('openrouter');
  const [model, setModel] = useState('openai/gpt-4o-mini');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !systemPrompt.trim()) return;

    setCreating(true);
    try {
      await api.post('/assistants', {
        name,
        description: description || undefined,
        systemPrompt,
        provider,
        model,
        temperature: 0.7,
        maxTokens: 2048,
        ragEnabled: true,
        ragTopK: 5,
      });
      mutate();
      setShowCreate(false);
      setName('');
      setDescription('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create assistant');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assistant and all its conversations?')) return;
    setDeleting(id);
    try {
      await api.delete(`/assistants/${id}`);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Assistants</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage AI assistants with custom instructions and models.
          </p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showCreate ? 'Cancel' : 'New Assistant'}
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Create New Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Research Assistant"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this assistant"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">System Prompt *</label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Provider</label>
                  <select
                    value={provider}
                    onChange={(e) => {
                      const newProvider = e.target.value;
                      setProvider(newProvider);
                      if (newProvider === 'mistral') setModel('mistral-small-latest');
                      else if (newProvider === 'anthropic') setModel('claude-3-sonnet-20240229');
                      else if (newProvider === 'openrouter') setModel('openai/gpt-4o-mini');
                      else setModel('gpt-4o-mini');
                    }}
                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="openrouter">OpenRouter</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="mistral">Mistral AI</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Model</label>
                  <Input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="openai/gpt-4o-mini"
                    className="mt-1"
                  />
                </div>
              </div>
              <Button type="submit" disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Assistant
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {!assistants && !error && (
        <div className="text-center py-8">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 py-8">
          Failed to load assistants. Please try refreshing.
        </div>
      )}

      {/* Empty State */}
      {assistants && assistants.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Bot className="mx-auto h-12 w-12 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">No assistants yet</h3>
          <p className="text-sm mt-1">Create your first assistant to start chatting.</p>
        </div>
      )}

      {/* Assistants Grid */}
      {assistants && assistants.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {assistants.map((a) => (
            <Card key={a.id} className="relative group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{a.name}</CardTitle>
                      {a.description && (
                        <CardDescription className="text-xs mt-0.5 line-clamp-1">
                          {a.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600"
                    onClick={() => handleDelete(a.id)}
                    disabled={deleting === a.id}
                  >
                    {deleting === a.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    <Settings2 className="h-3 w-3" /> {a.provider}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    <MessageSquare className="h-3 w-3" /> {a.model}
                  </span>
                  {a.ragEnabled && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      RAG enabled
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-3 line-clamp-2">{a.systemPrompt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
