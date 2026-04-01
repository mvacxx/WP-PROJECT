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
- Fluxo endurecido com:
  - validação de transição de status
  - métodos centralizados no service (`markSendingToGeneration`, `markGenerated`, `markFailed`)
  - queue processor sem lógica de status direta (delegada ao service)

## WordPress Integration Adapter

Endpoints:
- `POST /api/v1/wordpress-integration/test-connection`
- `POST /api/v1/wordpress-integration/posts/list`
- `PATCH /api/v1/wordpress-integration/posts/:postId`
- `POST /api/v1/wordpress-integration/posts/upsert`
- `POST /api/v1/wordpress-integration/pages/upsert`

Provisionamento de instalação:
- `POST /api/v1/wordpress-installations/:id/provision` (resolve strategy por `method`: `manual`, `ssh_wp_cli`, `softaculous_api`)
- Transições de status de provisionamento validadas (`pending/failed -> running -> completed|failed`) para evitar fluxos inválidos.

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

## Testes automatizados (API)

- `apps/api` possui uma suíte inicial executável com `npm run test -w apps/api`:
  - valida transições permitidas/bloqueadas de `provisioning-status-machine`
  - valida resolução de estratégias no `ProvisioningStrategyFactory`
  - valida resolução de providers no `ContentGenerationProviderFactory`
  - implementação em `src/tests/run-tests.ts`


## Idempotência e retry (fase atual)

- Criação de `ContentJob` evita duplicação para combinação `projectId + title + keyword` em estados ativos.
- Enfileiramento BullMQ usa `jobId=contentJobId` para evitar jobs duplicados.
- `WordpressInstallation` evita criação duplicada quando já existe instalação ativa (`pending/running`) no mesmo projeto+método.
- Adapter WordPress possui `posts/upsert` e `pages/upsert` por `slug` para operações idempotentes.
- Adapter WordPress aplica timeout configurável (`WORDPRESS_HTTP_TIMEOUT_MS`) e retry exponencial para falhas transitórias (`429`/`5xx`) via `WORDPRESS_HTTP_MAX_RETRIES`.
