-- ============================================
-- Aisle AI Platform - Database Schema Script
-- ============================================
-- This script creates all tables, enums, indexes,
-- and foreign key constraints for the Aisle platform.
--
-- Usage:
--   docker exec -i aisle-postgres psql -U aisle -d aisle_db < scripts/init-db.sql
--
-- Or connect directly:
--   psql -h localhost -p 5433 -U aisle -d aisle_db -f scripts/init-db.sql
-- ============================================
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- ============================================
-- ENUM TYPES
-- ============================================
DO $$ BEGIN CREATE TYPE users_role_enum AS ENUM ('admin', 'manager', 'user');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE assistants_provider_enum AS ENUM ('openai', 'anthropic', 'openrouter');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE messages_role_enum AS ENUM ('system', 'user', 'assistant');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE documents_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- ============================================
-- TABLE: tenants
-- Root of the multi-tenancy hierarchy.
-- Every row in the system belongs to a tenant.
-- ============================================
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    settings JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
-- ============================================
-- TABLE: users
-- Users belong to exactly one tenant.
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role users_role_enum NOT NULL DEFAULT 'user',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
-- Unique constraint: one email per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_tenant_email ON users ("tenantId", email);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users ("tenantId");
-- ============================================
-- TABLE: assistants
-- AI assistants configured per tenant with
-- custom prompts, models, and RAG settings.
-- ============================================
CREATE TABLE IF NOT EXISTS assistants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    "systemPrompt" TEXT NOT NULL,
    provider assistants_provider_enum NOT NULL DEFAULT 'openai',
    model VARCHAR(100) NOT NULL DEFAULT 'gpt-4o-mini',
    temperature DECIMAL(3, 2) NOT NULL DEFAULT 0.7,
    "maxTokens" INTEGER NOT NULL DEFAULT 2048,
    "ragEnabled" BOOLEAN NOT NULL DEFAULT true,
    "ragTopK" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_assistants_tenant ON assistants ("tenantId");
-- ============================================
-- TABLE: conversations
-- Chat conversations between users and assistants.
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    "assistantId" UUID NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    summary TEXT,
    "totalTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON conversations ("tenantId");
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_assistant ON conversations ("tenantId", "assistantId");
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_user ON conversations ("tenantId", "userId");
-- ============================================
-- TABLE: messages
-- Individual messages within a conversation.
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    "conversationId" UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role messages_role_enum NOT NULL,
    content TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "contextChunks" JSONB,
    model VARCHAR(100),
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_tenant ON messages ("tenantId");
CREATE INDEX IF NOT EXISTS idx_messages_tenant_conversation ON messages ("tenantId", "conversationId");
-- ============================================
-- TABLE: documents
-- Uploaded documents in the knowledge base.
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    "assistantId" UUID NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    "s3Key" VARCHAR(500) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "fileSize" BIGINT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    status documents_status_enum NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "chunkCount" INTEGER NOT NULL DEFAULT 0,
    "characterCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_documents_tenant ON documents ("tenantId");
CREATE INDEX IF NOT EXISTS idx_documents_tenant_assistant ON documents ("tenantId", "assistantId");
-- ============================================
-- TABLE: document_chunks
-- Text chunks extracted from documents for RAG.
-- Embeddings are stored in Qdrant (referenced by embeddingId).
-- ============================================
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    "documentId" UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "startOffset" INTEGER NOT NULL,
    "endOffset" INTEGER NOT NULL,
    "tokenCount" INTEGER NOT NULL DEFAULT 0,
    "embeddingId" UUID,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_document_chunks_tenant ON document_chunks ("tenantId");
CREATE INDEX IF NOT EXISTS idx_document_chunks_tenant_document ON document_chunks ("tenantId", "documentId");
-- ============================================
-- TABLE: usage_logs
-- Tracks LLM token usage for billing/analytics.
-- ============================================
CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    "assistantId" UUID NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "conversationId" UUID,
    "tokensInput" INTEGER NOT NULL,
    "tokensOutput" INTEGER NOT NULL,
    "tokensTotal" INTEGER NOT NULL,
    model VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    "latencyMs" INTEGER,
    success BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_usage_logs_tenant ON usage_logs ("tenantId");
CREATE INDEX IF NOT EXISTS idx_usage_logs_tenant_assistant ON usage_logs ("tenantId", "assistantId");
CREATE INDEX IF NOT EXISTS idx_usage_logs_tenant_date ON usage_logs ("tenantId", "createdAt");
-- ============================================
-- UTILITY: Truncate all tables (for testing)
-- ============================================
-- TRUNCATE TABLE usage_logs, messages, conversations,
--     document_chunks, documents, assistants, users, tenants
--     CASCADE;
SELECT 'Aisle database schema created successfully!' AS status;