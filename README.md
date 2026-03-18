# WP Automation SaaS (Internal)

Plataforma interna para provisionar blogs WordPress e operar fluxo de conteúdo semiautomático com geração externa (ex.: SEOwriting), mantendo o WordPress como hub central.

## Fase 1 — Descoberta e Arquitetura

### 1) Arquitetura proposta (MVP + evolução)

#### Camadas
- **Frontend Admin (Next.js)**: dashboard interno para gestão de projetos, instalações WordPress, jobs de conteúdo e logs.
- **API Backend (NestJS)**: domínio central com regras de negócio, autenticação admin, integração WordPress, provisionamento e filas.
- **Banco (PostgreSQL + Prisma)**: estado transacional (projetos, instalações, jobs, logs, credenciais criptografadas).
- **Filas (Redis + BullMQ)**: orquestração assíncrona de provisionamento, sincronização e publicação.
- **Integradores (adapters/ports)**:
  - `ProvisioningProvider` (prioridade SSH + WP-CLI; futuro Softaculous API).
  - `WordpressClient` (REST API com múltiplas estratégias de autenticação).
  - `ContentProvider` (interface para fornecedor externo de conteúdo sem acoplamento rígido).

#### Princípios-chave
- WordPress é o sistema de registro de conteúdo.
- Fluxos críticos com idempotência, retry e logs por etapa.
- Credenciais sensíveis criptografadas em repouso.
- MVP com admin interno único, preparado para multiusuário depois.

### 2) Estrutura de pastas

```text
.
├── apps/
│   ├── api/                 # NestJS API
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── health/
│   │   │   └── prisma/
│   │   └── Dockerfile
│   └── web/                 # Next.js admin
│       ├── src/
│       │   ├── app/
│       │   └── components/
│       └── Dockerfile
├── packages/
│   └── shared/
├── prisma/
│   └── schema.prisma
├── docker-compose.yml
├── .env.example
└── README.md
```

### 3) Schema inicial do banco

Entidades principais:
- `AdminUser`
- `Project`
- `WordpressInstallation`
- `ContentJob`
- `ContentLog`
- `SystemLog`

Status principais:
- `ProjectStatus`: `draft`, `provisioning`, `ready`, `failed`, `paused`
- `ContentJobStatus`: `pending`, `sending_to_generation`, `generated`, `posted_to_wordpress`, `review_pending`, `published`, `failed`

### 4) Fluxos principais

#### A. Provisionamento de projeto
1. Admin cria projeto.
2. API persiste projeto e enfileira job `provision-project`.
3. Worker executa `ProvisioningProvider` via strategy.
4. Atualiza estado no banco e logs por etapa.

#### B. Conteúdo (geração + WordPress)
1. Admin cria `ContentJob`.
2. Worker envia para `ContentProvider`.
3. Resultado normalizado é enviado ao WordPress.
4. Post vira `review_pending` para revisão manual ou publicação automática.

#### C. Integração WordPress
- Teste de conexão
- CRUD de posts
- Ajustes de status/slug/categorias/tags/metadados

### 5) Decisões, riscos e trade-offs

Decisões:
- Monorepo com npm workspaces.
- Prisma como ORM e migrações.
- BullMQ + Redis para filas.
- Ports/adapters para provisionamento e provider de conteúdo.

Riscos:
- Dependência de ambiente real de hospedagem.
- Credenciais sensíveis.
- Instabilidade de APIs externas.

Mitigações:
- Estratégias com fallback e mocks.
- Criptografia + rotação de segredo.
- Retry com backoff + logs estruturados.

---

## Fase 2 — Bootstrap (implementado)

### Entregáveis implementados
- Monorepo com `apps/api`, `apps/web`, `packages/shared`.
- NestJS base (ConfigModule + validação de env + PrismaModule + Health endpoint).
- Next.js base (TypeScript + Tailwind + dashboard inicial).
- Prisma schema inicial pronto para migrações.
- Docker Compose com `postgres`, `redis`, e profile opcional `app` (api + web).
- Dockerfiles de `api` e `web` para ambiente de container.
- `.env.example` no root e por app.

### Pré-requisitos
- Node.js 22+
- Docker + Docker Compose

### Execução local (modo recomendado para desenvolvimento)

1. Criar variáveis:
```bash
cp .env.example .env
```

2. Subir infra:
```bash
npm run infra:up
```

3. Instalar dependências:
```bash
npm install
```

4. Gerar cliente prisma:
```bash
npm run prisma:generate
```

5. Rodar API e Web:
```bash
npm run dev:api
npm run dev:web
```

### Execução local (stack containerizada)

```bash
cp .env.example .env
npm run stack:up
```

### Endpoints iniciais
- API health: `GET http://localhost:3001/api/v1/health`
- Frontend: `http://localhost:3000`

### Segurança (MVP)
- Nunca versionar `.env`.
- `JWT_SECRET` forte e rotacionável.
- `CREDENTIALS_ENCRYPTION_KEY` com 32+ caracteres.

### Próximo passo (Fase 3)
- Migrations reais (`prisma migrate dev`).
- Módulos de domínio (projects, wordpress-installations, content-jobs, logs).
- CRUDs e filas BullMQ com workers.
