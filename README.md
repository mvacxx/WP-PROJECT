# WP Automation SaaS (Internal)

Plataforma interna para provisionar blogs WordPress e operar fluxo de conteúdo semiautomático com geração externa (ex.: SEOwriting), mantendo o WordPress como hub central.

## Status atual
- ✅ Fase 1 concluída: arquitetura e plano.
- ✅ Fase 2 concluída: bootstrap monorepo + infra local.
- ✅ Fase 3 concluída (backend): entidades, APIs CRUD principais, filas BullMQ e logs.

## Arquitetura resumida
- **Web Admin**: Next.js + TypeScript + Tailwind.
- **API**: NestJS + Prisma + BullMQ.
- **Persistência**: PostgreSQL.
- **Fila**: Redis.
- **Integração futura**: adapters para WordPress e provedores de conteúdo.

## Estrutura

```text
.
├── apps/
│   ├── api/
│   │   ├── src/common
│   │   ├── src/modules
│   │   │   ├── projects
│   │   │   ├── wordpress-installations
│   │   │   ├── content-jobs
│   │   │   ├── logs
│   │   │   └── queue
│   │   └── Dockerfile
│   └── web/
├── packages/shared
├── prisma/schema.prisma
└── docker-compose.yml
```

## Banco de dados (Prisma)

Entidades principais no schema:
- `AdminUser`
- `Project`
- `WordpressInstallation`
- `ContentJob`
- `ContentLog`
- `SystemLog`

Status principais:
- `ProjectStatus`: `draft`, `provisioning`, `ready`, `failed`, `paused`
- `ContentJobStatus`: `pending`, `sending_to_generation`, `generated`, `posted_to_wordpress`, `review_pending`, `published`, `failed`

## APIs da Fase 3

> Todas as rotas (exceto quando `ADMIN_API_KEY` não estiver definida) exigem header: `x-admin-api-key: <valor>`.

### Health
- `GET /api/v1/health`

### Projects
- `POST /api/v1/projects`
- `GET /api/v1/projects?page=1&pageSize=20`
- `GET /api/v1/projects/:id`
- `PATCH /api/v1/projects/:id`
- `DELETE /api/v1/projects/:id`

### WordPress Installations
- `POST /api/v1/wordpress-installations`
- `GET /api/v1/wordpress-installations/project/:projectId`
- `PATCH /api/v1/wordpress-installations/:id`
- `PATCH /api/v1/wordpress-installations/:id/status/:status`
- `POST /api/v1/wordpress-installations/test-connection`
- `PATCH /api/v1/wordpress-installations/project/:projectId/connection/:status`

### Content Jobs
- `POST /api/v1/content-jobs`
- `GET /api/v1/content-jobs?projectId=<id>&page=1&pageSize=20`
- `PATCH /api/v1/content-jobs/:id/status`

### Logs
- `POST /api/v1/logs/system`
- `GET /api/v1/logs/system?projectId=<id>&page=1&pageSize=20`
- `GET /api/v1/logs/content/:jobId`

## Filas (BullMQ)

- Queue: `content-generation-queue`
- Job: `generate-content`
- Ao criar `ContentJob`, o backend:
  1. persiste no banco com status `pending`
  2. cria log de conteúdo
  3. enfileira job com retry/backoff
- Worker inicial da Fase 3 muda status para `sending_to_generation` e grava log; em falha, marca `failed` + motivo.

## Segurança básica (MVP)
- `helmet` habilitado.
- `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`).
- `HttpExceptionFilter` global para resposta padronizada de erro.
- `ADMIN_API_KEY` opcional para proteção de rotas administrativas.
- Nunca versionar `.env`.

## Como executar (dev)

1. Variáveis:
```bash
cp .env.example .env
```

2. Infra:
```bash
npm run infra:up
```

3. Dependências:
```bash
npm install
```

4. Prisma:
```bash
npm run prisma:generate
# opcional quando houver migrations
npm run prisma:migrate
```

5. Apps:
```bash
npm run dev:api
npm run dev:web
```

## Como executar (stack docker)

```bash
cp .env.example .env
npm run stack:up
```

## Próximos passos (Fase 4+)
- Fase 4: interface admin completa consumindo as rotas já prontas.
- Fase 5: camada de integração WordPress desacoplada (REST + auth strategies).
- Fase 6: provisionamento via strategy (SSH/WP-CLI primeiro).
- Fase 7: interface `ContentProvider` e adapter do fornecedor externo.
