# Plano de performance — PassaNota

Documento vivo da demanda de deixar o produto mais leve, com cold start menor e sem loops de rede. Cobre **passanota-web** e **passanota-api**.

Status geral: **Fase 3 — código pronto** (aceite HAR `/notas` após deploy)

Como usar: cada fase começa por um bloco **Decisões desta fase**. Itens em aberto são resolvidos *antes* de implementar. Decisões já tomadas ficam registradas abaixo e não se reabrem sem motivo novo.

---

## Diagnóstico (HAR de 25/08/2026)

Sessão em `passanota.caldasdev.com.br`, mobile (Pixel 9), `/notas` → `/dashboard`.

| Sinal | Valor | Leitura |
|---|---|---|
| `onContentLoad` / `onLoad` | ~159s | Página não assenta; loop de rede em curso |
| Prefetch RSC (`_rsc=` / `next-router-prefetch`) | ~800 ocorrências | Next prefetchando links o tempo todo |
| Refresh de `/notas?_rsc=` | 14× | `router.refresh()` a cada ~5s |
| `GET /api/proxy/v1/invoices/{mesmo-id}` | 14× | Nota `pending` polada sem parar |

Causas raiz, em ordem de impacto:

1. Loop em `/notas`: poll + `router.refresh()` + prefetch de cada linha da tabela.
2. Cold start em cadeia: web (`min=0`) sobe, espera `/v1/auth/me`, aí a API (`min=0`) sobe com PyTorch/embeddings.
3. Layout autentica com `getMeServer()` e **bloqueia o shell inteiro** (`cache: "no-store"`).
4. Troca 30d → 90d no dashboard é navegação full-page + remount de todos os Recharts.

---

## Decisões já tomadas

Estas valem para todas as fases.

| ID | Decisão | Motivo |
|---|---|---|
| D1 | **`min-instances` permanece `0`** na API e no web | Custo de instância quente é alto demais para o estágio atual |
| D2 | **Não usar GPU no Cloud Run** | `--cpu-boost` (CPU no startup) já está ligado. GPU não acelera Next/FastAPI HTTP |
| D3 | **Não pingar o banco a partir do browser** | O `/health` da API já faz `SELECT 1`. O web pinga só a API |
| D4 | Trabalho em **fases sequenciais** (0 → 1 → 2 → 3) | Cada fase tem ROI próprio e pode ir para produção sozinha |
| D5 | Medir antes/depois de cada fase | Sem métrica, não sabemos se a fase fechou |

---

## Estratégia de cold start com `min=0`

Como não há instância sempre quente nem Scheduler, o plano substitui `min=1` por **acordar a API em paralelo ao web**:

1. **`instrumentation.ts` no web**: no boot da instância, fire-and-forget em `{API}/health/live` — quando o web acorda, a API acorda **junto**, não depois do `getMe`.
2. **CPU boost** permanece (já no `cloudbuild.yaml` dos dois serviços).
3. Fase 2 tira PyTorch/embeddings do processo HTTP, que é o que deixa a API pesada ao acordar.

Primeiro hit do dia ainda pode ser lento (web frio). A meta não é zero cold start; é **não empilhar web frio + API fria + loop de `/notas`**. Sem Scheduler.

---

## Métricas de aceite (baseline a coletar na Fase 0)

Anotar valores atuais na primeira sessão de trabalho. Meta é direção, não SLA rígido.

| Métrica | Onde | Baseline | Meta após Fase 0 | Meta após Fase 1–2 |
|---|---|---|---|---|
| TTFB `/dashboard` (quente) | DevTools / HAR | _a preencher_ | < 1,5s | < 800ms |
| TTFB `/dashboard` (frio) | HAR | _a preencher_ | web e API sobem em paralelo (ping no boot) | API HTTP sem torch |
| Tempo `/v1/auth/me` | Network | _a preencher_ | cache 30–60s no web | — |
| Tempo `/v1/dashboard?period=30d` | Network | _a preencher_ | sem regressão | payload menor em 90d |
| Requests em 60s parado em `/notas` com 1 pending | HAR | dezenas/centenas | **0 refresh cego; ≤1 poll/5s de status** | — |
| Prefetch `_rsc` em 60s em `/notas` | HAR | ~centenas | só hover/intenção | — |
| RAM web Cloud Run | `cloudbuild.yaml` | 512 Mi | 1 Gi | reavaliar |

---

## Fase 0 — Parar o sangramento

**Objetivo:** matar o loop de `/notas`, acordar API junto com o web, cachear `me`, folga de memória. Sem redesenhar o dashboard.

**Repos:** web + API (endpoint `id+status`). Sem GCP Scheduler.

### Decisões desta fase

| ID | Pergunta | Opções | Escolha |
|---|---|---|---|
| D0.1 | Como o web acorda a API no boot? | (a) `instrumentation.ts` → `/health/live` (b) só Scheduler | **(a)** — sem Scheduler |
| D0.2 | Intervalo do Cloud Scheduler? | 5 min / 10 min / só horário comercial | **N/A** — sem Scheduler |
| D0.3 | Poll de notas pending: o que bater? | (a) N× `GET /invoices/{id}` (hoje) (b) 1× lista `status=pending` (c) endpoint novo só `id+status` | **(c)** `GET /v1/invoices/statuses?ids=` |
| D0.4 | Quando atualizar a UI da lista? | (a) `router.refresh()` sempre (hoje) (b) refresh só se status mudou (c) SWR/estado local, sem RSC | **(b)** agora; (c) na Fase 3 |
| D0.5 | Prefetch dos links da tabela `/notas/{id}`? | (a) default Next (hoje) (b) `prefetch={false}` (c) prefetch no hover | **(b)** na tabela, filtros e nav |
| D0.6 | Timeout do poll pending? | 2 min / 3 min / infinito (hoje) | **3 min** + toast “ainda processando” |
| D0.7 | Cache de `getMeServer`? | 30s / 60s / não cachear | **60s**, chave `userId + empresaId` (não JWT) |
| D0.8 | Memória do web no Cloud Run? | 512 Mi (hoje) / 1 Gi / 512 Mi+cpu-boost só | **1 Gi** |

### Trabalho

**Web**

- [x] Reescrever `InvoicesTableWithPolling`: lock in-flight, poll de status, refresh só se mudou, timeout D0.6.
- [x] `prefetch={false}` nos `Link` da tabela (`invoices-table.tsx`) e nos itens de nav do `app-shell`.
- [x] Cachear `getMeServer` (D0.7). Auth continua obrigatória; só evita martelar `/v1/auth/me` a cada prefetch/refresh.
- [x] `instrumentation.ts`: ping fire-and-forget `{PASSANOTA_API_URL}/health/live` no boot Node (D0.1).
- [x] `cloudbuild.yaml` web: memória **1 Gi** (D0.8). `min-instances` **permanece 0** (D1).
- [x] `preconnect` no root layout para o Supabase (API é same-origin via proxy).

**API**

- [x] `GET /v1/invoices/statuses?ids=` — só `{ id, status }`, scoped à empresa, sem `selectinload`.

**GCP**

- [x] `--cpu-boost` já está nos dois deploys.
- [ ] ~~Cloud Scheduler~~ — cancelado (D0.1 / D0.2).

### Fora de escopo nesta fase

- Desmembrar o dashboard.
- Troca de período client-side.
- Tirar torch da API.
- `min-instances: 1`.

### Aceite

- HAR: parado 60s em `/notas` com 1+ pending → no máximo 1 `GET /api/proxy/v1/invoices/statuses` a cada 5s; **zero** `router.refresh` se o status não mudou; prefetch `_rsc` de detalhe não dispara sozinho.
- Cold start: quando o web acorda, ping `/health/live` dispara em paralelo ao first request (não depois do `getMe`).
- Navegação autenticada quente não chama `/v1/auth/me` em todo clique.

---

## Fase 1 — Dashboard em ilhas

**Objetivo:** shell aparece na hora; seções carregam sozinhas; troca 30d → 90d não trava a página.

**Repos:** web (principal) + API (granularidade / payload).

### Decisões desta fase

| ID | Pergunta | Opções | Escolha |
|---|---|---|---|
| D1.1 | Troca de período? | (a) `<Link>` full-page (hoje) (b) query string + `startTransition` + SWR (c) server action | **(b)** query string + `startTransition` (`?period=30d&granularity=week`). URL compartilhavel; seletor não remonta a página |
| D1.2 | O layout ainda espera `me`? | (a) sim, mas `me` cacheado (Fase 0) (b) shell estático + `me` em Suspense | **(a)** `me` cacheado 60s; sem Suspense de `me` no shell |
| D1.3 | Endpoint do dash? | (a) um `/v1/dashboard` monolítico (hoje) (b) `/summary` + `/charts` + `/recent` em paralelo no RSC (c) um all + client refetch por card | **(a)** uma `GET /v1/dashboard`. Independência é de **render** (shell, skeletons, viewport), não de 8 HTTP. Filtro de categoria nos cards principais continua nos endpoints leves |
| D1.4 | Skeleton na troca de período? | overlay no card / substituir por skeleton / `keepPreviousData` + opacidade | **keepPreviousData** + skeleton **só no card que refetcha** (séries). Summary e notas recentes atualizam no lugar |
| D1.5 | Charts abaixo da dobra? | montar todos (hoje) / `dynamic` quando entram no viewport | **viewport once** para pizza, produtos, volume, ticket (`rootMargin` ~200px; não desmonta ao sair) |
| D1.6 | Granularidade 90d / year? | dia (hoje) / semana / mês | **semana default**; **dia** só como opção em 30d e 90d; **remover Ano**. 7d é sempre dia |

### Trabalho

**Web**

- [x] `AppLayout` não esconde o dashboard atrás de um fetch longo além do `me` já cacheado (D1.2).
- [x] Página não faz `await` do payload; `DashboardView` client pinta header + skeletons das ilhas e busca **um** `GET /dashboard` via SWR.
- [x] `PeriodSelector` deixa de ser `<Link>` full-page (D1.1): botões + `startTransition` + `router.replace({ scroll: false })`.
- [x] `DashboardChartsSection`: um pending **por card** (período vs filtro de categoria); skeleton no refetch (D1.4).
- [x] Charts secundários só montam Recharts no viewport (D1.5). `dynamic(..., { ssr: false })` permanece.
- [x] Sem opção Ano; bookmark `?period=year` vira `30d`. 30d/90d têm chips Dia / Semana.

**API**

- [x] `GET /v1/dashboard` recebe `granularity` e passa a `spend_over_time` / stacked (D1.6). Default: `week` em 30d/90d, `day` em 7d.
- [x] Chave do `unstable_cache` do dashboard: `empresaId + period + granularity`, **sem JWT**.

### Fora de escopo nesta fase

- Tirar torch.
- Reescrever lista de notas em SWR (Fase 3).

### Aceite

- `/dashboard` mostra header + skeletons das ilhas **antes** dos gráficos Recharts.
- 30d → 90d: seletor responde na hora; dados anteriores ficam; skeleton só nos cards de gráfico.
- 90d default (semana) tem bem menos pontos que 90 barras diárias.
- Sem opção Ano; 30d/90d permitem Dia.
- Network: **1** `GET .../v1/dashboard` no load e **1** na troca de período (mais os fetches de categoria só se o usuário filtrar).

---

## Fase 2 — API HTTP leve

**Objetivo:** o processo que responde `/v1/auth/me` e `/v1/dashboard` não carrega PyTorch nem o modelo de embeddings no startup.

**Repos:** API (principal) + Cloud Tasks (já existe).

### Decisões desta fase

| ID | Pergunta | Opções | Escolha |
|---|---|---|---|
| D2.1 | Onde rodam embeddings? | (a) no processo HTTP, warmup no `lifespan` (hoje) (b) só no worker de Cloud Tasks (c) API da OpenAI, sem torch na imagem | **(b)** SentenceTransformer só no `passanota-worker`. Sem OpenAI embeddings |
| D2.2 | A imagem HTTP ainda instala torch? | sim / não | **não** na imagem do serviço `passanota-api` |
| D2.3 | Worker separado no Cloud Run? | mesmo serviço / serviço `passanota-worker` | **`passanota-worker`**. Tasks e encode batem nesse URL |
| D2.4 | `/health/live` vs `/health` no Scheduler? | live (sem DB) / health (com `SELECT 1`) | **N/A** — sem Scheduler (D0.1). Web pinga `/health/live`; worker usa o mesmo probe |

### Trabalho

- [x] Remover warmup de embeddings do `lifespan` da API HTTP (`APP_ROLE=http` e `all`). Worker pode aquecer o modelo sem bloquear `/me`.
- [x] `APP_ROLE=http|worker|all`; HTTP não importa `task_worker` / OpenCV.
- [x] `POST /internal/encode` no worker; busca semântica HTTP chama via OIDC; encode de itens só no worker.
- [x] Produção HTTP: enqueue Cloud Tasks **sem** fallback inline. Local `all` mantém inline.
- [x] Extra `ml` + Dockerfile slim HTTP + `Dockerfile.worker`; cloudbuild dois serviços; `TASK_HANDLER_BASE_URL` no worker.
- [x] Pool do `get_all` ≥ 8 sessões paralelas.
- [x] `min-instances` **continua 0** (D1).

### Aceite

- Cold start da API HTTP sem download/load de `SentenceTransformer`.
- `/health/live` responde em milissegundos após o uvicorn subir.
- Captura: Cloud Task no **worker**; nota vai a `parsed` com embeddings.
- `POST /v1/search/semantic` continua devolvendo resultados (encode no worker).
- Local `APP_ROLE=all`: captura/busca funcionam sem segundo processo.

---

## Fase 3 — Polish

**Objetivo:** menos RSC round-trips no dia a dia; lista de notas client-data; medir e fechar.

**Repos:** web.

### Decisões desta fase

| ID | Pergunta | Opções | Escolha |
|---|---|---|---|
| D3.1 | Lista `/notas` vira client fetch? | RSC full (hoje, pós-Fase 0) / SWR na tabela, RSC só no first paint | **SWR após first paint**. RSC sementeia linhas; filtro/sort/página no client |
| D3.2 | Prefetch no hover da tabela? | nunca / hover / viewport | **nunca** — mantém D0.5 (`prefetch={false}`). Sem hover. Paginação deixa de ser `Link` default |
| D3.3 | 512 Mi vs 1 Gi no web, depois das fases 0–2 | manter 1 Gi / voltar 512 Mi | **manter 1 Gi**. Não voltar a 512 Mi |

### Trabalho

- [x] SWR na lista de notas (filtro/sort/página sem reexecutar o layout).
- [x] Prefetch: manter D0.5; paginação sem `Link` (fecha vazamento `_rsc`).
- [x] Resource hints: `preconnect`/`prefetchDNS` do Supabase já no root (Fase 0); API é same-origin.
- [ ] Lighthouse + HAR de `/dashboard` e `/notas` (frio e quente); preencher tabela de métricas após deploy.
- [x] D3.3: web permanece **1 Gi**; `min-instances` 0.

### Aceite

- First paint de `/notas` (e URL com filtro) mostra linhas no HTML RSC.
- Filtro/sort/página: **0** `GET /v1/auth/me`; lista via SWR (`GET .../v1/invoices` client); tabela não esvazia (`keepPreviousData`).
- Pending: ≤1 `GET .../statuses` / 5s; sem `router.refresh` se o status não mudou.
- Prefetch `_rsc` de detalhe não dispara sozinho (incluindo Anterior/Próxima).
- Web Cloud Run **1 Gi**.

---

## Ordem de implementação sugerida (Fase 0, detalhe)

Quando formos executar a Fase 0, nesta ordem:

1. Fechar D0.1–D0.8 neste arquivo.
2. Endpoint `GET /v1/invoices/statuses`.
3. Loop `/notas` + `prefetch={false}`.
4. Cache de `me`.
5. `instrumentation.ts` ping.
6. Memória 1 Gi no web.
7. HAR de verificação (60s parado em `/notas` + first hit do dia).

---

## Fora desta demanda

- `min-instances: 1`
- GPU no Cloud Run
- Redesign visual do dashboard
- Trocar Recharts por outra lib (só reavaliar se a Fase 1 ainda deixar 90d pesado)
- OpenCV / `/scan` (já é `dynamic`; não está no caminho crítico do dash)

---

## Log de execução

| Data | Fase | O que entrou | HAR / nota |
|---|---|---|---|
| 2026-08-26 | — | Documento criado. D1–D5 fechadas. D0.*–D3.* em aberto. | HAR 25/08: loop `/notas` confirmado |
| 2026-08-26 | 0 | D0.* fechadas: sem Scheduler; endpoint `statuses`; prefetch off; cache `me` 60s; web 1 Gi. Implementado. | Aceite HAR após deploy |
| 2026-08-27 | 1 | D1.* fechadas: query+`startTransition`; 1× `GET /dashboard` no client; keepPreviousData; viewport secundários; semana default; sem Ano. Implementado. | Aceite HAR após deploy |
| 2026-08-27 | 0/1 | Fix loop `dashboard`↔`login` (ERR_TOO_MANY_REDIRECTS): `getMe` não usa mais `unstable_cache`+`cookies()`; layout não manda erro genérico para `/login`. | HAR local 27/08 |
| 2026-08-27 | 2 | D2.* fechadas: HTTP slim sem torch; `passanota-worker` com ST/OpenCV; encode via OIDC; sem warmup no HTTP. | Aceite cold start após deploy |
| 2026-08-27 | 3 | D3.* fechadas: `/notas` SWR após first paint; prefetch off; web 1 Gi. | Aceite HAR `/notas` após deploy |
