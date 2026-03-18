# WP Automation SaaS (Internal)

Plataforma interna para provisionar blogs WordPress e operar fluxo de conteúdo semiautomático com geração externa (ex.: SEOwriting), mantendo o WordPress como hub central.

## Status atual
- ✅ Fase 1 concluída: arquitetura e plano.
- ✅ Fase 2 concluída: bootstrap monorepo + infra local.
- ✅ Fase 3 concluída: backend com CRUD, logs e filas.
- ✅ Fase 4 iniciada: frontend admin funcional conectado à API.

## Arquitetura resumida
- **Web Admin**: Next.js + TypeScript + Tailwind.
- **API**: NestJS + Prisma + BullMQ.
- **Persistência**: PostgreSQL.
- **Fila**: Redis.

## Frontend Admin (Fase 4)

Rotas implementadas:
- `/` Dashboard com resumo e projetos recentes.
- `/projects` Lista de projetos com status.
- `/projects/new` Formulário de cadastro de projeto.
- `/projects/[id]` Detalhes do projeto com:
  - visão geral
  - instalações WordPress
  - jobs de conteúdo
  - logs do projeto
  - ações: acionar provisionamento, registrar instalação, criar job.

Configurações de frontend:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_ADMIN_API_KEY` (opcional, para enviar header `x-admin-api-key`).

## Backend (Fase 3)

Módulos:
- `projects`
- `wordpress-installations`
- `content-jobs`
- `logs`
- `queue`

Principais rotas:
- `GET /api/v1/health`
- `POST/GET/PATCH/DELETE /api/v1/projects`
- `POST/GET/PATCH /api/v1/wordpress-installations`
- `POST/GET/PATCH /api/v1/content-jobs`
- `POST/GET /api/v1/logs`

## Como executar (dev)

1. Criar env:
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

4. Prisma:
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Rodar apps:
```bash
npm run dev:api
npm run dev:web
```

## Próximo passo
- Avançar Fase 5 com camada de integração WordPress desacoplada (múltiplas estratégias de autenticação e operações de posts/pages).
