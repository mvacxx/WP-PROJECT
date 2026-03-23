# WP Automation SaaS (Internal)

Plataforma interna para provisionar blogs WordPress e operar fluxo de conteúdo semiautomático com WordPress como hub central.

## Arquitetura revisada (simplificada)

Para reduzir complexidade no MVP, a arquitetura foi simplificada em 4 blocos:

1. **Admin Web (Next.js)**
   - telas de projetos, instalações, jobs e logs.
2. **API (NestJS)**
   - regras de negócio + integração WordPress.
3. **Persistência (PostgreSQL + Prisma)**
   - estado de projetos, instalações, jobs e logs.
4. **Assíncrono (Redis + BullMQ)**
   - fila para execução de jobs de conteúdo.

### Decisões de simplificação aplicadas
- Guard admin aplicado **globalmente** no `AppModule` (removido uso repetido nos controllers).
- Módulo de WordPress Integration com DI direta e factory simplificada (sem wiring excessivo).
- `ContentJobsModule` sem `forwardRef` desnecessário.
- Documentação de produção separada em arquivo próprio.

## Status das fases
- ✅ Fase 1: arquitetura e plano.
- ✅ Fase 2: bootstrap monorepo e infraestrutura local.
- ✅ Fase 3: backend CRUD, logs e filas.
- ✅ Fase 4: frontend admin funcional.
- ✅ Fase 5: adapter WordPress desacoplado.

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
