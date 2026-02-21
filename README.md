# 🚀 Aisle — AI-Powered RAG Platform

<div align="center">

**Aisle** is a multi-tenant SaaS platform for building AI assistants with **Retrieval-Augmented Generation (RAG)**. Upload documents, create custom AI assistants, and chat with context-aware responses powered by your private knowledge base.

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Qdrant](https://img.shields.io/badge/Qdrant-FF0000?style=flat&logo=data:image/svg+xml;base64,&logoColor=white)](https://qdrant.tech/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## 📖 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Verification & Debugging](#-verification--debugging)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

- **Multi-Tenant Architecture** — Complete tenant isolation with per-tenant data, users, and assistants
- **RAG Pipeline** — Upload PDFs, DOCX, and TXT files → auto-extract text → chunk → embed → vector search
- **Multiple LLM Providers** — OpenAI, Anthropic, and OpenRouter (100+ models)
- **Custom AI Assistants** — Create assistants with custom system prompts, models, and RAG settings
- **Real-Time Chat** — Full conversational interface with message history
- **Knowledge Base** — Document management with upload, processing status tracking, and deletion
- **Vector Search** — Qdrant-powered semantic search with tenant-scoped filtering
- **Usage Tracking** — Token usage logs per assistant, user, and conversation
- **Modern Frontend** — Next.js 16 with Tailwind CSS, Shadcn UI components

---

## 🏗 Architecture

```
┌─────────────────┐     ┌─────────────────────────────────────────┐
│  Next.js 16     │────▶│           NestJS Backend API             │
│  Frontend       │     │                                         │
│  (Port 3001)    │     │  Auth │ Assistants │ Chat │ Knowledge   │
└─────────────────┘     └──────┬──────┬──────┬──────┬─────────────┘
                               │      │      │      │
              ┌────────────────┘      │      │      └──────────────┐
              ▼                       ▼      ▼                     ▼
     ┌────────────────┐   ┌──────────────┐ ┌──────────────┐  ┌─────────┐
     │  PostgreSQL    │   │   Qdrant     │ │   MinIO      │  │  Redis  │
     │  (Port 5433)   │   │  (Port 6333) │ │ (Port 9000)  │  │ (6379)  │
     │  Relational DB │   │  Vector DB   │ │ Object Store │  │  Cache  │
     └────────────────┘   └──────────────┘ └──────────────┘  └─────────┘
```

### RAG Pipeline Flow

```
Document Upload → S3 Storage → Text Extraction → Chunking → Embedding (OpenAI/OpenRouter)
                                                                    ↓
User Query → Query Embedding → Qdrant Vector Search → Context Injection → LLM Response
```

---

## 🛠 Tech Stack

| Layer            | Technology                                 | Purpose                      |
| ---------------- | ------------------------------------------ | ---------------------------- |
| **Frontend**     | Next.js 16, React, Tailwind CSS, Shadcn UI | User interface               |
| **Backend**      | NestJS 10, TypeScript, TypeORM             | REST API                     |
| **Database**     | PostgreSQL 15                              | Relational data storage      |
| **Vector DB**    | Qdrant                                     | Semantic search & embeddings |
| **Object Store** | MinIO (S3-compatible)                      | Document file storage        |
| **Cache**        | Redis 7                                    | Session & cache management   |
| **LLM**          | OpenRouter / OpenAI / Anthropic            | AI model inference           |
| **Auth**         | JWT (access + refresh tokens)              | Authentication               |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** ≥ v18.0.0 ([download](https://nodejs.org/))
- **npm** ≥ v9.0.0
- **Docker** & **Docker Compose** ([download](https://docs.docker.com/get-docker/))
- **Git** ([download](https://git-scm.com/))

You'll also need at least one LLM API key:

| Provider                     | Sign Up                                                              | Free Tier              |
| ---------------------------- | -------------------------------------------------------------------- | ---------------------- |
| **OpenRouter** (recommended) | [openrouter.ai/keys](https://openrouter.ai/keys)                     | Free credits on signup |
| **OpenAI**                   | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | $5 free credits        |
| **Anthropic**                | [console.anthropic.com](https://console.anthropic.com/)              | Limited free tier      |

> **Note:** OpenRouter is recommended as it provides access to 100+ models (GPT-4o, Claude, Llama, etc.) through a single API key. For embeddings, OpenRouter routes to OpenAI's embedding model automatically.

---

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/Aisle.git
cd Aisle

# 2. Install backend dependencies
npm install

# 3. Install frontend dependencies
cd frontend && npm install && cd ..

# 4. Copy environment file and configure API keys
cp .env.example .env
# Edit .env and add your API keys (see Environment Configuration below)

# 5. Start infrastructure services (PostgreSQL, Redis, Qdrant, MinIO)
cd docker && docker-compose up -d && cd ..

# 6. Create the MinIO storage bucket
docker exec aisle-minio mc alias set local http://localhost:9000 minio_admin minio_secret
docker exec aisle-minio mc mb local/aisle-documents

# 7. Start the backend (auto-creates database tables via TypeORM)
npm run start:dev

# 8. In a new terminal, start the frontend
cd frontend && npm run dev
```

🎉 **Open [http://localhost:3001](http://localhost:3001)** in your browser!

---

## 🔧 Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Required Configuration

```env
# Application
NODE_ENV=development
PORT=3000

# JWT (change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# PostgreSQL (matches docker-compose.yml)
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_USERNAME=aisle
DATABASE_PASSWORD=aisle_secret
DATABASE_NAME=aisle_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Qdrant Vector Database
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=documents

# MinIO Object Storage (matches docker-compose.yml)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minio_admin
S3_SECRET_KEY=minio_secret
S3_BUCKET=aisle-documents
S3_REGION=us-east-1

# ========================================
# LLM API Keys (at least one is required)
# ========================================
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key

# Default LLM Configuration
DEFAULT_LLM_PROVIDER=openrouter      # openai | anthropic | openrouter
DEFAULT_LLM_MODEL=openai/gpt-4o-mini # Model identifier
DEFAULT_EMBEDDING_MODEL=text-embedding-3-small

# RAG Configuration
RAG_CHUNK_SIZE=512
RAG_CHUNK_OVERLAP=50
RAG_TOP_K=5
```

> **Important:** When using `DEFAULT_LLM_PROVIDER=openrouter`, set `OPENROUTER_API_KEY` to a valid key. Embeddings will automatically route through OpenRouter as well.

---

## 🗄 Database Setup

### Automatic Setup (Recommended)

The backend uses **TypeORM** with `synchronize: true` in development, so all tables are created automatically when you run `npm run start:dev`. No manual SQL execution is needed.

### Manual Setup with SQL Script

A full SQL schema script is provided at `scripts/init-db.sql`. This is useful for:

- Setting up a fresh database manually
- Understanding the complete schema
- CI/CD pipeline database initialization

#### Running the SQL Script

```bash
# Option 1: Via Docker (recommended)
docker exec -i aisle-postgres psql -U aisle -d aisle_db < scripts/init-db.sql

# Option 2: Direct PostgreSQL connection
psql -h localhost -p 5433 -U aisle -d aisle_db -f scripts/init-db.sql
# Password: aisle_secret

# Option 3: Reset database (truncate all tables)
docker exec aisle-postgres psql -U aisle -d aisle_db -c \
  "TRUNCATE TABLE usage_logs, messages, conversations, document_chunks, documents, assistants, users, tenants CASCADE;"
```

### Database Schema

The platform uses **8 tables** with full multi-tenant isolation:

```
tenants ──┬── users
          ├── assistants ──┬── documents ── document_chunks
          │                ├── conversations ── messages
          │                └── usage_logs
          └────────────────────────────────────────────────
```

| Table             | Description                                           |
| ----------------- | ----------------------------------------------------- |
| `tenants`         | Organizations using the platform                      |
| `users`           | Users with roles (admin/manager/user) per tenant      |
| `assistants`      | AI assistants with custom prompts, models, RAG config |
| `conversations`   | Chat conversations between users and assistants       |
| `messages`        | Individual messages with role, content, token usage   |
| `documents`       | Uploaded knowledge base documents (PDF, DOCX, TXT)    |
| `document_chunks` | Text chunks extracted from documents for RAG          |
| `usage_logs`      | LLM token usage tracking for billing/analytics        |

### Viewing the Database

**Adminer** (web-based database GUI) is included in Docker Compose:

1. Open [http://localhost:8080](http://localhost:8080)
2. Login with:
   - **System:** PostgreSQL
   - **Server:** `postgres` (or `aisle-postgres`)
   - **Username:** `aisle`
   - **Password:** `aisle_secret`
   - **Database:** `aisle_db`

---

## 🚀 Running the Application

### Step 1: Start Infrastructure

```bash
cd docker
docker-compose up -d
```

Verify all containers are running:

```bash
docker-compose ps
```

Expected output:

| Service    | Container      | Port       | Status     |
| ---------- | -------------- | ---------- | ---------- |
| PostgreSQL | aisle-postgres | 5433       | ✅ healthy |
| Redis      | aisle-redis    | 6379       | ✅ healthy |
| Qdrant     | aisle-qdrant   | 6333       | ✅ started |
| MinIO      | aisle-minio    | 9000, 9001 | ✅ healthy |
| Adminer    | aisle-adminer  | 8080       | ✅ started |

### Step 2: Create MinIO Bucket (first time only)

```bash
docker exec aisle-minio mc alias set local http://localhost:9000 minio_admin minio_secret
docker exec aisle-minio mc mb local/aisle-documents
```

### Step 3: Start Backend

```bash
# From the project root
npm run start:dev
```

Backend starts at **http://localhost:3000**. You'll see:

```
🚀 Application is running on: http://localhost:3000
📡 Environment: development
✅ Health check: http://localhost:3000/health
📚 API Base: http://localhost:3000/api
```

### Step 4: Start Frontend

```bash
# In a new terminal
cd frontend
npm run dev
```

Frontend starts at **http://localhost:3001**.

### Step 5: Use the App

1. **Register** at [http://localhost:3001/register](http://localhost:3001/register)
2. **Create an Assistant** at `/assistants` → "New Assistant"
3. **Upload Documents** at `/knowledge` → "Choose File & Upload"
4. **Start Chatting** at `/chat` — your AI will search through uploaded documents!

---

## 📡 API Endpoints

### Authentication (Public)

| Method | Endpoint             | Description                |
| ------ | -------------------- | -------------------------- |
| `POST` | `/api/auth/register` | Register new user + tenant |
| `POST` | `/api/auth/login`    | Login (returns JWT)        |
| `POST` | `/api/auth/refresh`  | Refresh access token       |

### Assistants (Authenticated)

| Method   | Endpoint              | Description           |
| -------- | --------------------- | --------------------- |
| `POST`   | `/api/assistants`     | Create assistant      |
| `GET`    | `/api/assistants`     | List all assistants   |
| `GET`    | `/api/assistants/:id` | Get assistant details |
| `PATCH`  | `/api/assistants/:id` | Update assistant      |
| `DELETE` | `/api/assistants/:id` | Delete assistant      |

### Conversations (Authenticated)

| Method | Endpoint                          | Description                    |
| ------ | --------------------------------- | ------------------------------ |
| `POST` | `/api/conversations`              | Create conversation            |
| `GET`  | `/api/conversations`              | List conversations             |
| `GET`  | `/api/conversations/:id/messages` | Get conversation messages      |
| `POST` | `/api/conversations/:id/chat`     | Send message & get AI response |

### Knowledge Base (Authenticated)

| Method   | Endpoint                | Description                 |
| -------- | ----------------------- | --------------------------- |
| `POST`   | `/api/knowledge/upload` | Upload document (multipart) |
| `GET`    | `/api/knowledge`        | List all documents          |
| `GET`    | `/api/knowledge/:id`    | Get document details        |
| `DELETE` | `/api/knowledge/:id`    | Delete document             |

### Usage & Health

| Method | Endpoint                    | Description         |
| ------ | --------------------------- | ------------------- |
| `GET`  | `/api/usage/summary`        | Token usage summary |
| `GET`  | `/api/usage/assistants/:id` | Usage per assistant |
| `GET`  | `/health`                   | Health check        |

---

## 🧪 Testing

### Backend Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

### Manual API Testing (cURL)

```bash
# 1. Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "tenantName": "Test Org"
  }'

# Save the accessToken from the response
export TOKEN="<accessToken-from-response>"

# 2. Create an assistant
curl -X POST http://localhost:3000/api/assistants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Research Assistant",
    "systemPrompt": "You are a helpful research assistant.",
    "provider": "openrouter",
    "model": "openai/gpt-4o-mini"
  }'

# Save the assistant ID
export ASSISTANT_ID="<id-from-response>"

# 3. Upload a document
curl -X POST http://localhost:3000/api/knowledge/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/your/document.pdf" \
  -F "assistantId=$ASSISTANT_ID"

# 4. Create a conversation
curl -X POST http://localhost:3000/api/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"assistantId\": \"$ASSISTANT_ID\"}"

# Save the conversation ID
export CONVO_ID="<id-from-response>"

# 5. Chat (with RAG)
curl -X POST "http://localhost:3000/api/conversations/$CONVO_ID/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content": "What does the document say about deployment?"}'
```

---

## 🔍 Verification & Debugging

### Check Backend Health

```bash
curl http://localhost:3000/health
```

### Verify Docker Services

```bash
cd docker && docker-compose ps
```

### Check PostgreSQL Tables

```bash
# List all tables
docker exec aisle-postgres psql -U aisle -d aisle_db -c "\dt"

# Count rows in each table
docker exec aisle-postgres psql -U aisle -d aisle_db -c "
  SELECT 'tenants' AS table_name, COUNT(*) FROM tenants
  UNION ALL SELECT 'users', COUNT(*) FROM users
  UNION ALL SELECT 'assistants', COUNT(*) FROM assistants
  UNION ALL SELECT 'conversations', COUNT(*) FROM conversations
  UNION ALL SELECT 'messages', COUNT(*) FROM messages
  UNION ALL SELECT 'documents', COUNT(*) FROM documents
  UNION ALL SELECT 'document_chunks', COUNT(*) FROM document_chunks
  UNION ALL SELECT 'usage_logs', COUNT(*) FROM usage_logs;
"
```

### Verify Qdrant Vector Database

```bash
# List collections
curl http://localhost:6333/collections

# Check vector count in the documents collection
curl http://localhost:6333/collections/documents | python3 -m json.tool

# Browse stored vectors (first 2 points)
curl -X POST http://localhost:6333/collections/documents/points/scroll \
  -H "Content-Type: application/json" \
  -d '{"limit": 2, "with_payload": true, "with_vector": false}'
```

You can also access the Qdrant Dashboard at [http://localhost:6333/dashboard](http://localhost:6333/dashboard).

### Check MinIO Storage

```bash
# List files in the bucket
docker exec aisle-minio mc ls local/aisle-documents --recursive
```

Or access the MinIO Console at [http://localhost:9001](http://localhost:9001) (login: `minio_admin` / `minio_secret`).

### View Backend Logs

```bash
# If running with npm run start:dev, logs appear in the terminal
# To check for errors:
npm run start:dev 2>&1 | grep -i error
```

---

## 📁 Project Structure

```
Aisle/
├── docker/
│   ├── docker-compose.yml       # Infrastructure services
│   └── Dockerfile               # Production build
├── frontend/                    # Next.js 16 frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/          # Login & Register pages
│   │   │   ├── (dashboard)/     # Protected pages
│   │   │   │   ├── chat/        # Chat interface
│   │   │   │   ├── assistants/  # Assistant management
│   │   │   │   ├── knowledge/   # Document upload & RAG
│   │   │   │   └── settings/    # User settings
│   │   │   └── page.tsx         # Landing page
│   │   ├── components/
│   │   │   ├── chat/            # Chat UI components
│   │   │   ├── layout/          # Sidebar, navigation
│   │   │   └── ui/              # Shadcn UI primitives
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # API client, utilities
│   │   ├── store/               # Zustand auth store
│   │   └── types/               # TypeScript interfaces
│   └── package.json
├── src/                         # NestJS backend
│   ├── common/
│   │   ├── decorators/          # @Tenant, @Roles, @Public
│   │   ├── guards/              # JWT & Role guards
│   │   ├── interceptors/        # Logging, tenant injection
│   │   └── interfaces/          # Shared types
│   ├── config/                  # App configuration
│   ├── database/
│   │   └── entities/            # TypeORM entities (8 tables)
│   └── modules/
│       ├── auth/                # Authentication (register, login, JWT)
│       ├── assistants/          # AI assistant CRUD
│       ├── conversations/       # Chat & message handling
│       ├── knowledge/           # Document upload & storage
│       ├── ingestion/           # RAG pipeline (extract, chunk, embed)
│       ├── vector-search/       # Qdrant integration
│       ├── llm-gateway/         # Multi-provider LLM abstraction
│       └── usage/               # Token usage tracking
├── scripts/
│   └── init-db.sql              # Database schema SQL script
├── .env                         # Environment variables
├── .env.example                 # Template for env vars
├── package.json                 # Backend dependencies
├── tsconfig.json                # TypeScript config
└── README.md                    # This file
```

---

## 🐛 Troubleshooting

### Port already in use

```bash
# Kill process on port 3000
fuser -k 3000/tcp

# Kill process on port 3001
fuser -k 3001/tcp
```

### File watcher limit (Linux)

If you see `Error: ENOSPC: System limit for number of file watchers reached`:

```bash
sudo sysctl fs.inotify.max_user_watches=524288
# Or use polling:
WATCHPACK_POLLING=true npm run dev
```

### Docker containers not starting

```bash
cd docker
docker-compose down
docker-compose up -d
docker-compose logs -f  # Watch logs for errors
```

### MinIO bucket doesn't exist

```bash
docker exec aisle-minio mc alias set local http://localhost:9000 minio_admin minio_secret
docker exec aisle-minio mc mb local/aisle-documents
```

### PDF upload fails

Ensure `pdf-parse` v1.x is installed:

```bash
npm install pdf-parse@1.1.1
```

### OpenAI quota errors (429)

Set `DEFAULT_LLM_PROVIDER=openrouter` in `.env` and use your OpenRouter API key. OpenRouter handles embeddings through OpenAI's API automatically.

### Database reset

```bash
docker exec aisle-postgres psql -U aisle -d aisle_db -c \
  "TRUNCATE TABLE usage_logs, messages, conversations, document_chunks, documents, assistants, users, tenants CASCADE;"
```

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  Built with ❤️ using NestJS, Next.js, and open-source AI
</div>
