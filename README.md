# Aisle - Multi-Tenant RAG SaaS Platform

A production-ready, multi-tenant SaaS application that enables organizations to create AI assistants powered by Large Language Models with Retrieval Augmented Generation (RAG).

## Features

- **Multi-Tenancy**: Complete tenant isolation at all layers
- **AI Assistants**: Create, configure, and manage AI assistants
- **RAG Pipeline**: Document ingestion, chunking, embedding, and semantic search
- **Multiple LLM Providers**: OpenAI and Anthropic support with unified interface
- **Usage Tracking**: Token usage tracking for billing and analytics
- **Role-Based Access**: Admin, Manager, and User roles

## Tech Stack

| Component        | Technology                    |
| ---------------- | ----------------------------- |
| Backend          | Node.js + TypeScript + NestJS |
| Database         | PostgreSQL                    |
| Cache/Session    | Redis                         |
| Vector Database  | Qdrant                        |
| Object Storage   | S3/MinIO                      |
| LLM Providers    | OpenAI, Anthropic             |
| Containerization | Docker + Docker Compose       |

## Quick Start

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- OpenAI API key (required)
- Anthropic API key (optional)

### 1. Clone and Install

```bash
cd /home/gourav/Desktop/Aisle
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your API keys
```

### 3. Start Infrastructure

```bash
docker-compose -f docker/docker-compose.yml up -d postgres redis qdrant minio
```

### 4. Run the Application

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication

| Method | Endpoint             | Description              |
| ------ | -------------------- | ------------------------ |
| POST   | `/api/auth/register` | Register new user/tenant |
| POST   | `/api/auth/login`    | User login               |
| POST   | `/api/auth/refresh`  | Refresh access token     |

### Assistants

| Method | Endpoint              | Description           |
| ------ | --------------------- | --------------------- |
| GET    | `/api/assistants`     | List all assistants   |
| POST   | `/api/assistants`     | Create assistant      |
| GET    | `/api/assistants/:id` | Get assistant details |
| PATCH  | `/api/assistants/:id` | Update assistant      |
| DELETE | `/api/assistants/:id` | Delete assistant      |

### Conversations

| Method | Endpoint                          | Description            |
| ------ | --------------------------------- | ---------------------- |
| GET    | `/api/conversations`              | List conversations     |
| POST   | `/api/conversations`              | Start new conversation |
| GET    | `/api/conversations/:id/messages` | Get message history    |
| POST   | `/api/conversations/:id/chat`     | Send chat message      |

### Knowledge Base

| Method | Endpoint                | Description           |
| ------ | ----------------------- | --------------------- |
| GET    | `/api/knowledge`        | List documents        |
| POST   | `/api/knowledge/upload` | Upload document       |
| GET    | `/api/knowledge/:id`    | Get document metadata |
| DELETE | `/api/knowledge/:id`    | Delete document       |

### Usage

| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| GET    | `/api/usage/summary`        | Get tenant usage summary |
| GET    | `/api/usage/assistants/:id` | Get assistant usage      |

## Project Structure

```
src/
├── common/                    # Shared utilities
│   ├── decorators/           # @Tenant, @Roles, @Public
│   ├── guards/               # JWT, RBAC guards
│   ├── filters/              # Exception filters
│   └── interfaces/           # TenantContext, etc.
├── config/                   # Configuration
├── database/
│   └── entities/             # TypeORM entities
└── modules/
    ├── auth/                 # Authentication
    ├── assistants/           # Assistant management
    ├── conversations/        # Chat engine
    ├── knowledge/            # Document storage
    ├── ingestion/            # Processing pipeline
    ├── vector-search/        # Semantic search
    ├── llm-gateway/          # LLM abstraction
    └── usage/                # Usage tracking
```

## Chat Flow

The complete chat request lifecycle:

1. **Request** → Incoming chat message
2. **Auth** → Resolve tenant context from JWT
3. **Session** → Load conversation state from Redis
4. **RAG** → Vector search for relevant documents (if enabled)
5. **Prompt** → Build prompt with system + context + history
6. **LLM** → Call LLM provider via gateway
7. **Persist** → Save messages to PostgreSQL
8. **Session** → Update Redis session state
9. **Usage** → Log token usage for billing
10. **Response** → Return AI response

## Multi-Tenancy

All data is isolated by tenant:

- Every database table includes `tenantId`
- Vector searches are filtered by `tenantId`
- JWT tokens contain tenant information
- Guards enforce tenant context on all operations

## Environment Variables

```env
# Application
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=aisle
DATABASE_PASSWORD=aisle_secret
DATABASE_NAME=aisle_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=documents

# S3/MinIO
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minio_admin
S3_SECRET_KEY=minio_secret
S3_BUCKET=aisle-documents

# LLM
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
DEFAULT_LLM_PROVIDER=openai
DEFAULT_LLM_MODEL=gpt-4o-mini
```

## License

MIT
