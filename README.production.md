# WP Automation SaaS — Guia de Produção

Este documento descreve como operar o sistema em ambiente de produção com foco em segurança, confiabilidade e observabilidade.

## 1) Objetivo

Colocar em produção os serviços:
- `api` (NestJS)
- `web` (Next.js)
- `postgres` (banco principal)
- `redis` (fila BullMQ)

com boas práticas de:
- segredos e criptografia
- deploy sem downtime relevante
- backup e restore
- monitoramento e logs
- runbook de incidentes

---

## 2) Arquitetura recomendada (produção)

- **Reverse proxy/TLS**: Nginx, Traefik, Cloudflare Tunnel ou LB gerenciado.
- **Web (`apps/web`)**: 1+ réplicas.
- **API (`apps/api`)**: 2+ réplicas para alta disponibilidade.
- **PostgreSQL**: serviço gerenciado (preferível) ou instância dedicada com backup contínuo.
- **Redis**: serviço gerenciado ou instância dedicada com persistência AOF/RDB conforme SLA.
- **Storage de logs**: stack centralizada (ELK, Loki, Datadog, etc.).

> Recomendação forte: usar PostgreSQL e Redis gerenciados para reduzir risco operacional no MVP.

---

## 3) Variáveis de ambiente de produção

Nunca reutilize segredos de desenvolvimento.

### API
- `NODE_ENV=production`
- `API_PORT=3001`
- `API_PREFIX=api/v1`
- `CORS_ORIGIN=https://SEU-DOMINIO-ADMIN`
- `DATABASE_URL=postgresql://...`
- `REDIS_URL=redis://...`
- `JWT_SECRET=<segredo forte com rotação>`
- `CREDENTIALS_ENCRYPTION_KEY=<32+ chars>`
- `ADMIN_API_KEY=<chave longa e randômica>`

### Web
- `NODE_ENV=production`
- `NEXT_PUBLIC_API_URL=https://SEU-DOMINIO-API/api/v1`
- `NEXT_PUBLIC_ADMIN_API_KEY=<somente se sua estratégia aceitar chave pública; preferir proxy seguro>`

## Política de segredos
- Armazenar em Secret Manager (AWS Secrets Manager, GCP Secret Manager, Vault, etc.).
- Rotacionar `JWT_SECRET`, `ADMIN_API_KEY` e `CREDENTIALS_ENCRYPTION_KEY` periodicamente.
- Nunca expor segredos em logs.

---

## 4) Build e deploy

## 4.1 Build

No pipeline CI:

```bash
npm ci
npm run build
```

Gerar imagens:

```bash
docker build -f apps/api/Dockerfile -t registry/seu-projeto/api:<tag> .
docker build -f apps/web/Dockerfile -t registry/seu-projeto/web:<tag> .
```

Publicar imagens no registry privado.

## 4.2 Migrações Prisma

Antes de subir nova versão da API:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Execute migração como etapa controlada (job único), não em múltiplas réplicas simultâneas.

## 4.3 Estratégia de rollout

- **Blue/Green** ou **Rolling Update**.
- Subir nova versão da API, validar healthcheck, depois trocar tráfego.
- Subir nova versão da Web.
- Em falha, rollback para imagem anterior.

---

## 5) Banco de dados e backups

## 5.1 Backups
- Backup diário completo + WAL/binlog contínuo (ou equivalente).
- Retenção mínima: 7/14/30 dias conforme criticidade.
- Criptografia em repouso e em trânsito.

## 5.2 Restore testado
- Testar restore pelo menos 1x por mês em ambiente isolado.
- Medir RPO/RTO real e registrar no runbook.

## 5.3 Índices e manutenção
- Monitorar crescimento de `ContentJob`, `ContentLog`, `SystemLog`.
- Definir política de retenção/arquivamento de logs antigos.

---

## 6) Redis e filas (BullMQ)

- Ativar persistência adequada ao SLA.
- Monitorar filas:
  - jobs pendentes
  - taxa de falha
  - retries
  - tempo médio de processamento
- Definir alertas para:
  - fila parada
  - crescimento anormal da fila
  - taxa de falha > limiar

---

## 7) Segurança

## 7.1 Rede e acesso
- API e DB sem exposição pública direta.
- Acesso admin somente via frontend autenticado/rede privada/VPN.
- Firewall/SG restritivo (least privilege).

## 7.2 Hardening
- `helmet` ativo na API.
- Rate limiting (recomendado adicionar no próximo ciclo).
- WAF no edge (Cloudflare/AWS WAF).

## 7.3 Credenciais WordPress
- Armazenar sempre criptografadas em repouso.
- Evitar salvar credenciais em texto puro.
- Auditoria de acesso a segredos.

---

## 8) Observabilidade

## Logs
- Estruturar logs em JSON no ambiente de produção.
- Correlacionar `projectId`, `contentJobId`, `requestId`.

## Métricas mínimas
- API: latência p95/p99, erro 5xx, throughput.
- Fila: tempo de execução, retries, falhas.
- Banco: conexões, lock waits, slow queries.
- Infra: CPU/memória/disco.

## Alertas mínimos
- API indisponível > 1 min.
- Taxa 5xx acima de limiar por 5 min.
- Falha de conexão com PostgreSQL/Redis.
- Fila sem consumo/worker offline.

---

## 9) Healthcheck e readiness

- Health endpoint atual: `GET /api/v1/health`.
- Recomendação: evoluir para health composto com verificação de:
  - PostgreSQL
  - Redis
  - fila worker

Use readiness/liveness no orquestrador (Kubernetes, ECS, etc.).

---

## 10) Runbook de incidentes (resumo)

## API fora
1. Verificar healthcheck e logs.
2. Confirmar conectividade com DB/Redis.
3. Reverter deploy se regressão.

## Fila parada
1. Verificar worker e conexão Redis.
2. Reiniciar worker.
3. Reprocessar jobs falhos (com critério).

## Erros WordPress Integration
1. Validar credenciais e método auth (`application_password` ou `bearer_token`).
2. Validar disponibilidade do endpoint `/wp-json/wp/v2`.
3. Repetir operação com retry controlado.

---

## 11) Checklist antes de go-live

- [ ] Segredos gerenciados externamente.
- [ ] TLS ativo (HTTPS obrigatório).
- [ ] Migrações aplicadas em banco de produção.
- [ ] Backups e restore testados.
- [ ] Alertas configurados.
- [ ] Logs centralizados funcionando.
- [ ] Runbook publicado para o time.
- [ ] Processo de rollback validado.

---

## 12) Próximas melhorias recomendadas

1. Adicionar autenticação administrativa robusta (session/JWT + RBAC), removendo dependência de header fixo para uso humano.
2. Adicionar rate limit e proteção anti-abuso.
3. Implementar healthcheck composto (DB/Redis/queue).
4. Adicionar testes automatizados de integração para rotas críticas.
5. Implementar criptografia aplicada no fluxo de credenciais WordPress (com rotação de chave assistida).
