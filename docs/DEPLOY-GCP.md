# Deploy no Google Cloud Run

Projeto GCP: **caldas-projects-dev** | Região: **us-central1**

## Pré-requisitos

1. Infra GCP — ver [passanota-api/docs/DEPLOY-GCP.md](../passanota-api/docs/DEPLOY-GCP.md)
2. API deployada com IAM (`--no-allow-unauthenticated`) e IAM configurado entre Web → API
3. Artifact Registry com repositório `passanota` na região `us-central1`

## Variáveis de ambiente

### Build-time (`NEXT_PUBLIC_*`)

Essas variáveis são **inlined no bundle JavaScript durante o `docker build`**. Devem ser passadas como `--build-arg` no Dockerfile. Definir no Cloud Run em runtime **não** corrige valores ausentes no bundle.

| Variável no código | Substitution no trigger | Exemplo |
|--------------------|-------------------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `_SUPABASE_URL` | `https://[ref].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` |
| `NEXT_PUBLIC_APP_URL` | `_APP_URL` | `https://passanota-web-....run.app` |

A publishable key do Supabase é **pública por design** (exposta no browser). Não é necessário Secret Manager.

### Runtime (Cloud Run)

| Variável | Substitution no trigger | Quando |
|----------|-------------------------|--------|
| `PASSANOTA_API_URL` | `_PASSANOTA_API_URL` | Sempre em produção |
| `PASSANOTA_API_USE_IAM` | — | Omitir (auto). Use `false` só em dev local |

`NODE_ENV`, `PORT` e `HOSTNAME` são definidos no Dockerfile.

## Cloud Build trigger

Use um único arquivo: [`cloudbuild.yaml`](../cloudbuild.yaml).

**Evento:** push na branch `main` (ou conforme sua preferência).

**Build config:** `cloudbuild.yaml`

### Substitutions obrigatórias no trigger

Configure em **Cloud Build → Triggers → Edit → Substitution variables**:

| Substitution | Valor |
|--------------|-------|
| `_SUPABASE_URL` | URL do projeto Supabase |
| `_SUPABASE_PUBLISHABLE_KEY` | Publishable key do Supabase |
| `_APP_URL` | URL pública deste frontend (Cloud Run) |
| `_PASSANOTA_API_URL` | URL da API Cloud Run |

Defaults já definidos em `cloudbuild.yaml` (podem ficar como estão):

| Substitution | Default |
|--------------|---------|
| `_REGION` | `us-central1` |
| `_AR_REPOSITORY` | `passanota` |
| `_SERVICE_NAME` | `passanota-web` |

### Pipeline

1. `docker build` com `--build-arg` para as três `NEXT_PUBLIC_*`
2. `docker push` para Artifact Registry (`$SHORT_SHA`)
3. `gcloud run deploy` com `PASSANOTA_API_URL` em runtime

### Trigger gerenciado do Cloud Run

Se o deploy foi criado pelo console **Cloud Run → Continuous deployment**, o Google pode gerar um build inline que roda só `docker build .` **sem** passar `--build-arg`. Nesse caso, edite o trigger e aponte o **Build configuration** para `cloudbuild.yaml` deste repositório.

## Deploy manual

```bash
gcloud builds submit --project=caldas-projects-dev \
  --config=cloudbuild.yaml \
  --substitutions=_SUPABASE_URL=https://ref.supabase.co,_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...,_APP_URL=https://passanota-web-XXXX.run.app,_PASSANOTA_API_URL=https://passanota-api-XXXX.run.app
```

## Desenvolvimento local

Copie `.env.example` para `.env.local` e preencha os valores.

```bash
pnpm install
pnpm dev
```

## Build local com Docker (opcional)

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_... \
  --build-arg NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  -t passanota-web:local .

docker run --rm -p 8080:8080 \
  -e PASSANOTA_API_URL=http://host.docker.internal:8000 \
  -e PASSANOTA_API_USE_IAM=false \
  passanota-web:local
```

## Pós-deploy — Supabase

1. **Authentication → URL Configuration**
   - Site URL: mesma URL de `_APP_URL`
   - Redirect URLs: `https://<web-url>/auth/callback`, `https://<web-url>/auth/confirm`
2. Redeploy da API com `_FRONTEND_URL` = URL final do frontend

## Sequência de rollout

1. IAM na API (Web SA pode invocar API)
2. Deploy API
3. Deploy Web (este repositório)
4. Validar login, dashboard, upload de nota, pairing mobile
