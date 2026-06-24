# Deploy no Google Cloud Run

Projeto GCP: **caldas-projects-dev** | Região: **us-central1**

## Pré-requisitos

1. Infra GCP — ver [passanota-api/docs/DEPLOY-GCP.md](../passanota-api/docs/DEPLOY-GCP.md)
2. API deployada com IAM (`--no-allow-unauthenticated`) e `setup-api-iam.ps1` executado
3. Secret `PASSANOTA_SUPABASE_PUBLISHABLE_KEY` no Secret Manager

```powershell
"sb_publishable_..." | gcloud secrets create PASSANOTA_SUPABASE_PUBLISHABLE_KEY --replication-policy=automatic --data-file=-
```

Conceda `roles/secretmanager.secretAccessor` ao Cloud Build SA e ao Cloud Run SA.

### Variáveis no trigger (recomendado)

Configure no trigger GitHub — **não precisa de Secret Manager para URLs**:

| Substitution | Exemplo |
|--------------|---------|
| `_TAG` | `$SHORT_SHA` |
| `_SUPABASE_URL` | `https://[ref].supabase.co` |
| `_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` |
| `_APP_URL` | `https://passanota-web-....run.app` |
| `_PASSANOTA_API_URL` | `https://passanota-api-....run.app` |

O secret `PASSANOTA_SUPABASE_PUBLISHABLE_KEY` é **opcional** — use só se preferir não colocar a publishable key na substitution.

`scripts/setup-deploy-secrets.ps1` é alternativa legada; não é necessário se o trigger já tem as substitutions acima.

## Cloud Build via GitHub

### Trigger gerenciado do Cloud Run (`gcp-cloud-build-deploy-cloud-run`)

Se o deploy foi criado pelo console **Cloud Run → Continuous deployment**, o Google gera um build inline que roda só `docker build .` **sem** passar as substitutions como `--build-arg`. As variáveis `_SUPABASE_URL` etc. ficam no trigger mas **não chegam** ao Dockerfile.

**Correção (uma vez):** aponte o trigger para `cloudbuild.managed.yaml`:

```powershell
.\scripts\patch-cloud-run-trigger.ps1
```

Ou manualmente:

```powershell
gcloud builds triggers update rmgpgab-passanota-web-us-central1-lucastere10-passanota-web-rqi `
  --project=caldas-projects-dev `
  --build-config=cloudbuild.managed.yaml
```

Esse arquivo usa as mesmas substitutions do trigger e passa `--build-arg` corretamente.

### Trigger customizado (recomendado para CI completo)

| Trigger | Evento | Arquivo |
|---------|--------|---------|
| `passanota-web-pr` | PR → `main` | `cloudbuild.pr.yaml` |
| `passanota-web-main` | Push → `main` | `cloudbuild.yaml` |

Substitutions obrigatórias no trigger **main**:

- `_TAG=$SHORT_SHA`
- `_PASSANOTA_API_URL` — URL da API Cloud Run
- `_SUPABASE_URL` — URL do projeto Supabase
- `_APP_URL` — URL pública deste frontend

```powershell
.\scripts\setup-cloud-build-trigger.ps1 -GitHubOwner SEU_USER -GitHubRepo passanota-web `
  -PassanotaApiUrl "https://passanota-api-....run.app" `
  -SupabaseUrl "https://....supabase.co" `
  -AppUrl "https://passanota-web-....run.app"
```

Pipeline **main**: validate secrets → lint → typecheck → docker build → push → deploy.

Pipeline **PR**: validate → lint → typecheck → docker build (sem deploy).

## Deploy manual

```powershell
$env:TAG = "hotfix-2026-06-23"; .\scripts\deploy.ps1
```

Com substitutions:

```bash
gcloud builds submit --project=caldas-projects-dev \
  --config=cloudbuild.yaml \
  --substitutions=_TAG=v1.0.0,_PASSANOTA_API_URL=https://passanota-api-XXXX.run.app,_SUPABASE_URL=https://ref.supabase.co,_APP_URL=https://passanota-web-XXXX.run.app
```

## Variáveis de ambiente

| Variável | Quando | Origem |
|----------|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Build + runtime | substitution `_SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Build + runtime | Secret Manager |
| `SUPABASE_URL` | Runtime (middleware/server) | Cloud Run env (`_SUPABASE_URL`) |
| `SUPABASE_PUBLISHABLE_KEY` | Runtime (middleware/server) | Secret Manager no Cloud Run |
| `NEXT_PUBLIC_APP_URL` | Build + runtime | substitution `_APP_URL` |
| `PASSANOTA_API_URL` | Runtime | Cloud Run env |
| `PASSANOTA_API_USE_IAM` | Runtime | omitir (auto) ou `false` em dev local |

**Importante:** variáveis `NEXT_PUBLIC_*` precisam estar no **docker build** (build-args) para o bundle do browser. O middleware/server também usam `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` em **runtime** no Cloud Run — configure-as no deploy (já feito em `cloudbuild.yaml`).

Se o trigger não passar `_SUPABASE_URL`, `_APP_URL` e o secret, o build falha na validação ou no Dockerfile.

## Pós-deploy — Supabase

1. **Authentication → URL Configuration**
   - Site URL: mesma URL de `_APP_URL`
   - Redirect URLs: `https://<web-url>/auth/callback`, `https://<web-url>/auth/confirm`
2. Redeploy da API com `_FRONTEND_URL` = URL final do frontend

## Sequência de rollout

1. Secrets + IAM na API
2. Deploy API
3. Deploy Web (este repositório)
4. Validar login, dashboard, upload de nota, pairing mobile

## Build local (opcional)

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
