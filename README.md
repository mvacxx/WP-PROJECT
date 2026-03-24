# WP Automation SaaS (Internal)

Plataforma interna para provisionar blogs WordPress e operar fluxo de conteúdo semiautomático com WordPress como hub central.

## Arquitetura revisada (simplificada)

1. **Admin Web (Next.js)**
2. **API (NestJS)**
3. **Persistência (PostgreSQL + Prisma)**
4. **Assíncrono (Redis + BullMQ)**

## Segurança MVP (atual)

- Guard global com separação de credencial por escopo:
  - `x-auth-scope: human` + `x-admin-api-key`
  - `x-auth-scope: system` + `x-system-api-key`
- Health endpoint público (`GET /api/v1/health`)
- Auditoria básica para mutações HTTP (`AuditLogInterceptor`).

## SecretsService (atual)

- Serviço central para criptografar/decriptar secrets sensíveis.
- Algoritmo: `AES-256-GCM` com chave derivada de `CREDENTIALS_ENCRYPTION_KEY`.
- Aplicado em credenciais de `WordpressInstallation` (`wpApplicationPassword`, `sshPrivateKey`).
- Responses de instalação não expõem segredo (somente flags `hasWpApplicationPassword` e `hasSshPrivateKey`).

## Domínio ContentJob (fase atual)

- Campos adicionados:
  - `attemptCount`
  - `lastAttemptAt`
  - `providerJobId`
  - `providerStatus`
  - `targetPublishMode`
- `provider` passou para enum (`seowriting`, `manual`, `generic`).
- `installationType` de projeto passou para enum (`vps`, `shared_hosting`, `cloud`, `manual`).

## WordPress Integration Adapter

Endpoints:
- `POST /api/v1/wordpress-integration/test-connection`
- `POST /api/v1/wordpress-integration/posts/list`
- `PATCH /api/v1/wordpress-integration/posts/:postId`
- `POST /api/v1/wordpress-integration/pages/upsert`

Auth methods suportados:
- `application_password`
- `bearer_token`

## Execução local

1. Copiar env:
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

## Produção

Consulte `README.production.md` para deploy e operação em produção.
