# WP Automation SaaS (Internal)

Plataforma interna para provisionar blogs WordPress e operar fluxo de conteúdo semiautomático com geração externa (ex.: SEOwriting), mantendo o WordPress como hub central.

## Status atual
- ✅ Fase 1 concluída: arquitetura e plano.
- ✅ Fase 2 concluída: bootstrap monorepo + infra local.
- ✅ Fase 3 concluída: backend com CRUD, logs e filas.
- ✅ Fase 4 iniciada: frontend admin funcional conectado à API.
- ✅ Fase 5 iniciada: adapter WordPress desacoplado com strategies de autenticação.

## WordPress Integration Adapter (Fase 5)

A camada foi implementada em `apps/api/src/modules/wordpress-integration` e segue padrão de portas/adapters:

- `WordpressHttpClient`: cliente HTTP para `/wp-json/wp/v2`.
- `WordpressAuthFactory`: escolhe estratégia de autenticação.
- Strategies incluídas:
  - `application_password` (Basic Auth)
  - `bearer_token` (Bearer token)
- `WordpressIntegrationService`: orquestra operações e grava logs.
- `WordpressIntegrationController`: expõe APIs da integração.

### Endpoints
- `POST /api/v1/wordpress-integration/test-connection`
- `POST /api/v1/wordpress-integration/posts/list`
- `PATCH /api/v1/wordpress-integration/posts/:postId`
- `POST /api/v1/wordpress-integration/pages/upsert`

### Exemplos de payload

#### Testar conexão
```json
{
  "siteUrl": "https://meusite.com",
  "auth": {
    "method": "application_password",
    "username": "admin",
    "applicationPassword": "xxxx xxxx xxxx xxxx"
  }
}
```

#### Listar posts
```json
{
  "siteUrl": "https://meusite.com",
  "auth": {
    "method": "bearer_token",
    "bearerToken": "jwt-ou-token"
  },
  "page": 1,
  "perPage": 10,
  "status": "draft"
}
```

#### Atualizar post
```json
{
  "siteUrl": "https://meusite.com",
  "auth": {
    "method": "application_password",
    "username": "admin",
    "applicationPassword": "xxxx xxxx xxxx xxxx"
  },
  "status": "publish",
  "slug": "novo-slug",
  "categories": [3],
  "tags": [10, 11]
}
```

#### Criar/atualizar página
```json
{
  "siteUrl": "https://meusite.com",
  "auth": {
    "method": "application_password",
    "username": "admin",
    "applicationPassword": "xxxx xxxx xxxx xxxx"
  },
  "title": "Privacy Policy",
  "slug": "privacy-policy",
  "content": "<p>Conteúdo...</p>",
  "status": "draft"
}
```

## Frontend Admin (Fase 4)

Rotas implementadas:
- `/` Dashboard com resumo e projetos recentes.
- `/projects` Lista de projetos com status.
- `/projects/new` Formulário de cadastro de projeto.
- `/projects/[id]` Detalhes do projeto com visão geral, instalações, jobs, logs e ações.

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
