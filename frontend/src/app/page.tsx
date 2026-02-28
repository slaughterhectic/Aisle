import Image from "next/image";

import Link from 'next/link';
import { ArrowRight, Database, Bot, Zap, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-zinc-50 font-sans selection:bg-purple-500/30">
      {/* Navbar Minimal */}
      <nav className="fixed top-0 w-full border-b border-white/10 bg-black/50 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold text-lg">A</div>
            <span className="font-semibold text-xl tracking-tight">Multi Tenant Chat</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-16 px-6">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto mt-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-300 mb-8 tracking-wide">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
            Multi Tenant Chat v1.0 is now live
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            Your Intelligence <br /> Amplified.
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Multi Tenant Chat is a state-of-the-art RAG platform that connects your private knowledge base to powerful LLMs. Get instant, accurate answers from your documents.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="h-12 px-8 rounded-full bg-white text-black flex items-center gap-2 font-medium hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95">
              Start Building Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="h-12 px-8 rounded-full bg-white/10 text-white flex items-center gap-2 font-medium hover:bg-white/20 transition-all border border-white/5 hover:scale-105 active:scale-95">
              Enter Workspace
            </Link>
          </div>
        </div>

        {/* Features Preview */}
        <div className="max-w-7xl mx-auto mt-32 grid md:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 hover:border-white/20 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Database className="w-7 h-7 text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Knowledge Engines</h3>
            <p className="text-zinc-400 leading-relaxed">Upload PDFs, docs, and text. Let Multi Tenant Chat vectorize and index your knowledge securely using Qdrant vector database.</p>
          </div>
          <div className="p-8 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 hover:border-white/20 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Bot className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Custom Assistants</h3>
            <p className="text-zinc-400 leading-relaxed">Configure distinct AI personas hooked to specific documents and instructions for beautifully tailored outputs.</p>
          </div>
          <div className="p-8 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 hover:border-white/20 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
            <p className="text-zinc-400 leading-relaxed">Powered by NestJS, Redis, and best-in-class vector search, delivering enterprise-grade responses in milliseconds.</p>
          </div>
        </div>

        {/* Mockup / Dashboard Preview snippet */}
        <div className="max-w-5xl mx-auto mt-32 relative rounded-2xl border border-white/10 bg-zinc-900/50 p-2 backdrop-blur-sm overflow-hidden group shadow-2xl shadow-purple-900/20">
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none"></div>
          <div className="rounded-xl border border-white/5 bg-zinc-950 flex flex-col h-[400px]">
            <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2 bg-zinc-900/40">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            </div>
            <div className="flex-1 p-8 opacity-70 group-hover:opacity-100 transition-opacity duration-700">
              <div className="max-w-2xl mx-auto md:mx-0">
                <div className="flex gap-4 mb-6">
                  <div className="w-8 h-8 rounded bg-zinc-800 flex-shrink-0 mt-1"></div>
                  <div className="h-10 rounded-xl w-64 bg-zinc-800/80 animate-pulse"></div>
                </div>
                <div className="flex gap-4 mb-6 flex-row-reverse">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 mt-1 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <span className="text-xs font-bold text-white">A</span>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-600/20 border border-purple-500/20 text-sm text-zinc-300 w-full md:w-[80%] shadow-inner flex flex-col gap-3">
                    <p>"Based on the provided knowledge base, the Q3 earnings grew by 24% year-over-year, largely driven by the adoption of our new AI features."</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-1 rounded bg-black/40 text-zinc-400 border border-white/5 flex items-center gap-1"><Database className="w-3 h-3" /> Q3_Report.pdf</span>
                      <span className="text-xs px-2 py-1 rounded bg-black/40 text-zinc-400 border border-white/5 flex items-center gap-1"><Database className="w-3 h-3" /> Financials_2024.xlsx</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
