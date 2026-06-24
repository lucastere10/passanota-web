# GCP — Guia de Referência Completo

**Projeto:** `caldas-projects-dev` | **Região padrão:** `us-central1`  
**Comandos:** PowerShell (Windows) — todos testados no ambiente do projeto.

---

## Índice

1. [Configuração Inicial do gcloud CLI](#1-configuração-inicial-do-gcloud-cli)
2. [Secret Manager](#2-secret-manager)
3. [Service Accounts e IAM](#3-service-accounts-e-iam)
4. [Cloud Run — Segurança e Configuração](#4-cloud-run--segurança-e-configuração)
5. [Cloud Build — Triggers via CLI](#5-cloud-build--triggers-via-cli)
6. [Dockerfiles — Next.js e FastAPI](#6-dockerfiles--nextjs-e-fastapi)
7. [cloudbuild.yaml — Referência Completa](#7-cloudbuildyaml--referência-completa)
8. [Builds Locais e Manuais via CLI](#8-builds-locais-e-manuais-via-cli)
9. [Cheatsheet de Comandos Rápidos](#9-cheatsheet-de-comandos-rápidos)

---

## 1. Configuração Inicial do gcloud CLI

### Instalação e autenticação

```powershell
# Verificar instalação
gcloud version

# Login interativo (abre browser)
gcloud auth login

# Login específico para chamadas de API/SDK (Docker, ADC)
gcloud auth application-default login

# Definir projeto padrão (evita --project em todo comando)
gcloud config set project caldas-projects-dev

# Definir região/zona padrão
gcloud config set run/region us-central1
gcloud config set compute/zone us-central1-a

# Ver configuração ativa
gcloud config list

# Ver conta autenticada
gcloud auth list
```

### Gerenciar múltiplos projetos / contas

```powershell
# Criar configuração nomeada (útil para alternar entre projetos)
gcloud config configurations create passanota-dev
gcloud config configurations activate passanota-dev
gcloud config set account seu-email@gmail.com
gcloud config set project caldas-projects-dev

# Alternar entre configurações
gcloud config configurations activate default
gcloud config configurations activate passanota-dev

# Listar configurações
gcloud config configurations list
```

### Habilitar APIs necessárias

```powershell
# Habilitar tudo necessário de uma vez
gcloud services enable `
  run.googleapis.com `
  cloudbuild.googleapis.com `
  secretmanager.googleapis.com `
  artifactregistry.googleapis.com `
  iam.googleapis.com `
  --project=caldas-projects-dev

# Verificar quais estão habilitadas
gcloud services list --enabled --project=caldas-projects-dev
```

---

## 2. Secret Manager

O Secret Manager armazena valores sensíveis (chaves de API, tokens, senhas) de forma versionada e auditada. O Cloud Build e o Cloud Run acessam os secrets em runtime — **nunca** coloque valores sensíveis como variáveis de ambiente hardcoded.

### Criar secrets

```powershell
# Criar a partir de string (pipe no PowerShell)
"minha-chave-secreta" | gcloud secrets create NOME_DO_SECRET `
  --replication-policy=automatic `
  --data-file=- `
  --project=caldas-projects-dev

# Criar a partir de arquivo
gcloud secrets create NOME_DO_SECRET `
  --replication-policy=automatic `
  --data-file="C:\caminho\para\arquivo.txt" `
  --project=caldas-projects-dev

# Criar sem valor (adicionar versão depois)
gcloud secrets create NOME_DO_SECRET `
  --replication-policy=automatic `
  --project=caldas-projects-dev
```

### Adicionar novas versões (atualizar valor)

```powershell
# Adicionar nova versão a partir de string
"novo-valor" | gcloud secrets versions add NOME_DO_SECRET `
  --data-file=- `
  --project=caldas-projects-dev

# Adicionar nova versão a partir de arquivo
gcloud secrets versions add NOME_DO_SECRET `
  --data-file="C:\caminho\arquivo.txt" `
  --project=caldas-projects-dev
```

### Consultar e inspecionar secrets

```powershell
# Listar todos os secrets do projeto
gcloud secrets list --project=caldas-projects-dev

# Descrever um secret (metadados, não o valor)
gcloud secrets describe NOME_DO_SECRET --project=caldas-projects-dev

# Listar versões de um secret
gcloud secrets versions list NOME_DO_SECRET --project=caldas-projects-dev

# Acessar (ler) o valor atual — use com cuidado!
gcloud secrets versions access latest `
  --secret=NOME_DO_SECRET `
  --project=caldas-projects-dev

# Acessar versão específica
gcloud secrets versions access 3 `
  --secret=NOME_DO_SECRET `
  --project=caldas-projects-dev
```

> **Atenção:** O comando `secrets versions access` imprime o valor em texto puro no terminal. Evite usar em logs compartilhados ou ambientes com screen recording.

### Gerenciar versões

```powershell
# Desativar versão antiga (mantém o histórico, não pode ser acessada)
gcloud secrets versions disable 1 `
  --secret=NOME_DO_SECRET `
  --project=caldas-projects-dev

# Destruir versão (irreversível)
gcloud secrets versions destroy 1 `
  --secret=NOME_DO_SECRET `
  --project=caldas-projects-dev

# Reativar versão desativada
gcloud secrets versions enable 1 `
  --secret=NOME_DO_SECRET `
  --project=caldas-projects-dev
```

### Deletar secret (todas as versões)

```powershell
gcloud secrets delete NOME_DO_SECRET --project=caldas-projects-dev
```

### Secrets do projeto passanota

```powershell
# Secret da chave pública do Supabase (usado pelo passanota-web)
"sb_publishable_SEU_VALOR" | gcloud secrets create PASSANOTA_SUPABASE_PUBLISHABLE_KEY `
  --replication-policy=automatic `
  --data-file=- `
  --project=caldas-projects-dev

# Verificar se o secret existe
gcloud secrets describe PASSANOTA_SUPABASE_PUBLISHABLE_KEY --project=caldas-projects-dev
```

---

## 3. Service Accounts e IAM

### Conceito

Service Accounts são identidades usadas por serviços (Cloud Build, Cloud Run) para acessar recursos GCP. Em vez de colocar credenciais no código, você atribui papéis (roles) a uma service account e associa ela ao serviço.

**Service accounts importantes no projeto:**
- **Cloud Build SA:** `<PROJECT_NUMBER>@cloudbuild.gserviceaccount.com` — executa os steps do build
- **Cloud Run SA:** `<PROJECT_NUMBER>-compute@developer.gserviceaccount.com` — executa a aplicação em runtime

### Descobrir números e e-mails das SAs padrão

```powershell
# Project number (diferente de project ID)
$PROJECT_NUMBER = gcloud projects describe caldas-projects-dev --format="value(projectNumber)"
Write-Host "Project Number: $PROJECT_NUMBER"

# SAs padrão
$CLOUD_BUILD_SA = "$PROJECT_NUMBER@cloudbuild.gserviceaccount.com"
$CLOUD_RUN_SA   = "$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

Write-Host "Cloud Build SA: $CLOUD_BUILD_SA"
Write-Host "Cloud Run SA:   $CLOUD_RUN_SA"
```

### Criar service account personalizada

```powershell
# Criar SA
gcloud iam service-accounts create passanota-runner `
  --display-name="Passanota Cloud Run Runner" `
  --project=caldas-projects-dev

# E-mail da SA criada
$SA_EMAIL = "passanota-runner@caldas-projects-dev.iam.gserviceaccount.com"
```

### Listar e inspecionar service accounts

```powershell
# Listar todas as SAs do projeto
gcloud iam service-accounts list --project=caldas-projects-dev

# Ver detalhes de uma SA
gcloud iam service-accounts describe $SA_EMAIL --project=caldas-projects-dev

# Ver papéis atribuídos (IAM policy do projeto)
gcloud projects get-iam-policy caldas-projects-dev `
  --flatten="bindings[].members" `
  --format="table(bindings.role, bindings.members)" `
  --filter="bindings.members:$SA_EMAIL"
```

### Atribuir papéis (roles)

```powershell
# Sintaxe geral
gcloud projects add-iam-policy-binding caldas-projects-dev `
  --member="serviceAccount:$SA_EMAIL" `
  --role="roles/NOME_DO_PAPEL"

# Papéis comuns:
# roles/run.admin              → gerenciar Cloud Run
# roles/run.invoker            → invocar serviços Cloud Run
# roles/secretmanager.secretAccessor → ler secrets
# roles/artifactregistry.writer      → fazer push de imagens
# roles/cloudbuild.builds.builder    → executar builds
# roles/storage.objectAdmin          → ler/escrever no GCS
# roles/iam.serviceAccountTokenCreator → criar tokens para outras SAs

# Exemplo: permitir Cloud Build SA fazer deploy no Cloud Run
gcloud projects add-iam-policy-binding caldas-projects-dev `
  --member="serviceAccount:$CLOUD_BUILD_SA" `
  --role="roles/run.admin"

# Exemplo: permitir Cloud Build SA agir como a SA de runtime
gcloud iam service-accounts add-iam-policy-binding $CLOUD_RUN_SA `
  --member="serviceAccount:$CLOUD_BUILD_SA" `
  --role="roles/iam.serviceAccountUser" `
  --project=caldas-projects-dev
```

### Permitir acesso a secrets por service account

```powershell
# Formato: gcloud secrets add-iam-policy-binding NOME_SECRET --member SA --role accessor

# Cloud Build SA acessa o secret no build
gcloud secrets add-iam-policy-binding PASSANOTA_SUPABASE_PUBLISHABLE_KEY `
  --member="serviceAccount:$CLOUD_BUILD_SA" `
  --role="roles/secretmanager.secretAccessor" `
  --project=caldas-projects-dev

# Cloud Run SA acessa o secret em runtime
gcloud secrets add-iam-policy-binding PASSANOTA_SUPABASE_PUBLISHABLE_KEY `
  --member="serviceAccount:$CLOUD_RUN_SA" `
  --role="roles/secretmanager.secretAccessor" `
  --project=caldas-projects-dev

# Verificar quem tem acesso ao secret
gcloud secrets get-iam-policy PASSANOTA_SUPABASE_PUBLISHABLE_KEY `
  --project=caldas-projects-dev
```

### Criar e baixar chave de SA (para uso local ou CI externo)

```powershell
# ATENÇÃO: evite chaves de SA sempre que possível. Prefira Workload Identity.
# Use apenas quando necessário (ex: CI que não é GCP).

gcloud iam service-accounts keys create "C:\temp\sa-key.json" `
  --iam-account=$SA_EMAIL `
  --project=caldas-projects-dev

# Usar a chave localmente
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\temp\sa-key.json"

# Listar chaves de uma SA
gcloud iam service-accounts keys list `
  --iam-account=$SA_EMAIL `
  --project=caldas-projects-dev

# Deletar chave (pelo KEY_ID listado acima)
gcloud iam service-accounts keys delete KEY_ID `
  --iam-account=$SA_EMAIL `
  --project=caldas-projects-dev
```

---

## 4. Cloud Run — Segurança e Configuração

### `--allow-unauthenticated` vs `--no-allow-unauthenticated`

Este é o controle principal de acesso público ao serviço:

| Flag | Comportamento | Quando usar |
|------|---------------|-------------|
| `--allow-unauthenticated` | Qualquer pessoa na internet pode chamar o serviço | Frontend (Next.js), APIs públicas |
| `--no-allow-unauthenticated` | Exige token de autenticação GCP para cada requisição | APIs internas, backends privados |

```powershell
# Tornar serviço público (após deploy)
gcloud run services add-iam-policy-binding passanota-web `
  --member="allUsers" `
  --role="roles/run.invoker" `
  --region=us-central1 `
  --project=caldas-projects-dev

# Remover acesso público (tornar privado)
gcloud run services remove-iam-policy-binding passanota-web `
  --member="allUsers" `
  --role="roles/run.invoker" `
  --region=us-central1 `
  --project=caldas-projects-dev

# Verificar política de acesso do serviço
gcloud run services get-iam-policy passanota-web `
  --region=us-central1 `
  --project=caldas-projects-dev
```

### Permitir que o frontend (passanota-web) chame a API privada

```powershell
# A SA do Cloud Run do web precisa invocar a SA da API
$WEB_SA = "$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

gcloud run services add-iam-policy-binding passanota-api `
  --member="serviceAccount:$WEB_SA" `
  --role="roles/run.invoker" `
  --region=us-central1 `
  --project=caldas-projects-dev
```

### Inspecionar e gerenciar serviços Cloud Run

```powershell
# Listar serviços
gcloud run services list --region=us-central1 --project=caldas-projects-dev

# Descrever serviço (URL, configurações)
gcloud run services describe passanota-web `
  --region=us-central1 `
  --project=caldas-projects-dev

# Ver só a URL
gcloud run services describe passanota-web `
  --region=us-central1 `
  --format="value(status.url)" `
  --project=caldas-projects-dev

# Ver variáveis de ambiente configuradas
gcloud run services describe passanota-web `
  --region=us-central1 `
  --format="yaml(spec.template.spec.containers[0].env)" `
  --project=caldas-projects-dev

# Atualizar variável sem redeploy completo
gcloud run services update passanota-web `
  --region=us-central1 `
  --update-env-vars="NOVA_VAR=valor" `
  --project=caldas-projects-dev

# Remover variável
gcloud run services update passanota-web `
  --region=us-central1 `
  --remove-env-vars="VAR_ANTIGA" `
  --project=caldas-projects-dev
```

### Configurar secrets no Cloud Run (runtime)

```powershell
# Montar secret como variável de ambiente em runtime
gcloud run services update passanota-web `
  --region=us-central1 `
  --update-secrets="SUPABASE_PUBLISHABLE_KEY=PASSANOTA_SUPABASE_PUBLISHABLE_KEY:latest" `
  --project=caldas-projects-dev

# Montar secret como arquivo (útil para certificados, service account keys)
gcloud run services update passanota-api `
  --region=us-central1 `
  --update-secrets="/secrets/sa-key.json=MY_SA_KEY:latest" `
  --project=caldas-projects-dev

# Remover secret montado
gcloud run services update passanota-web `
  --region=us-central1 `
  --remove-secrets="SUPABASE_PUBLISHABLE_KEY" `
  --project=caldas-projects-dev
```

### Listar revisões e tráfego

```powershell
# Listar revisões (histórico de deploys)
gcloud run revisions list `
  --service=passanota-web `
  --region=us-central1 `
  --project=caldas-projects-dev

# Ver distribuição de tráfego entre revisões
gcloud run services describe passanota-web `
  --region=us-central1 `
  --format="yaml(spec.traffic)" `
  --project=caldas-projects-dev

# Rollback: enviar 100% do tráfego para revisão anterior
gcloud run services update-traffic passanota-web `
  --to-revisions=passanota-web-00042-abc=100 `
  --region=us-central1 `
  --project=caldas-projects-dev
```

---

## 5. Cloud Build — Triggers via CLI

### Conectar repositório GitHub ao Cloud Build

Antes de criar triggers, conecte o repositório no console ou via CLI:

```powershell
# Listar conexões existentes
gcloud builds connections list --region=us-central1 --project=caldas-projects-dev

# Criar conexão GitHub (necessário uma vez por organização/usuário)
gcloud builds connections create github passanota-github-connection `
  --region=us-central1 `
  --project=caldas-projects-dev
# Isso retorna uma URL para autorizar no GitHub — abra no browser

# Após autorizar, listar repositórios disponíveis
gcloud builds repositories list `
  --connection=passanota-github-connection `
  --region=us-central1 `
  --project=caldas-projects-dev

# Criar link para o repositório específico
gcloud builds repositories create passanota-web-repo `
  --remote-uri="https://github.com/SEU_USER/passanota-web.git" `
  --connection=passanota-github-connection `
  --region=us-central1 `
  --project=caldas-projects-dev
```

### Criar triggers

```powershell
# Trigger para push na branch main (deploy completo)
gcloud builds triggers create github `
  --name="passanota-web-main" `
  --repository="projects/caldas-projects-dev/locations/us-central1/connections/passanota-github-connection/repositories/passanota-web-repo" `
  --branch-pattern="^main$" `
  --build-config="cloudbuild.yaml" `
  --substitutions="_TAG=`$SHORT_SHA,_PASSANOTA_API_URL=https://passanota-api-XXXX.run.app,_SUPABASE_URL=https://ref.supabase.co,_APP_URL=https://passanota-web-XXXX.run.app,_MIN_INSTANCES=0" `
  --region=us-central1 `
  --project=caldas-projects-dev

# Trigger para PRs (lint + build, sem deploy)
gcloud builds triggers create github `
  --name="passanota-web-pr" `
  --repository="projects/caldas-projects-dev/locations/us-central1/connections/passanota-github-connection/repositories/passanota-web-repo" `
  --pull-request-pattern="^main$" `
  --build-config="cloudbuild.pr.yaml" `
  --region=us-central1 `
  --project=caldas-projects-dev
```

### Gerenciar triggers existentes

```powershell
# Listar triggers
gcloud builds triggers list --region=us-central1 --project=caldas-projects-dev

# Descrever trigger (ver substituições configuradas)
gcloud builds triggers describe passanota-web-main `
  --region=us-central1 `
  --project=caldas-projects-dev

# Executar trigger manualmente (sem push no GitHub)
gcloud builds triggers run passanota-web-main `
  --branch=main `
  --region=us-central1 `
  --project=caldas-projects-dev

# Atualizar substituições de um trigger existente
gcloud builds triggers import `
  --source="trigger-config.yaml" `
  --region=us-central1 `
  --project=caldas-projects-dev

# Deletar trigger
gcloud builds triggers delete passanota-web-main `
  --region=us-central1 `
  --project=caldas-projects-dev
```

### Monitorar builds

```powershell
# Listar builds recentes
gcloud builds list --limit=10 --project=caldas-projects-dev

# Listar builds de um trigger específico
gcloud builds list `
  --filter="trigger_id=TRIGGER_ID" `
  --limit=5 `
  --project=caldas-projects-dev

# Ver logs de um build em tempo real
gcloud builds log BUILD_ID --stream --project=caldas-projects-dev

# Cancelar build em andamento
gcloud builds cancel BUILD_ID --project=caldas-projects-dev
```

---

## 6. Dockerfiles — Next.js e FastAPI

### Next.js — Dockerfile multi-stage otimizado

Este é o Dockerfile atual do `passanota-web`, com comentários explicando cada decisão:

```dockerfile
# ── Stage 1: base ─────────────────────────────────────────────────────────────
# Imagem alpine = menor tamanho. libc6-compat necessária para algumas libs Node.
# corepack habilita o pnpm sem instalar globalmente.
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat \
    && corepack enable \
    && corepack prepare pnpm@8.15.9 --activate

# ── Stage 2: deps ─────────────────────────────────────────────────────────────
# Separado do builder para cache de camadas: se só o código mudar (não o
# package.json), o Docker reutiliza este stage em vez de reinstalar tudo.
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── Stage 3: builder ──────────────────────────────────────────────────────────
# ARG = disponível apenas no build time. Necessário para NEXT_PUBLIC_* porque
# o Next.js embute os valores no bundle estático durante o `next build`.
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_APP_URL

# Converte ARG → ENV para o processo de build do Next.js ler
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NODE_ENV=production

# Validação obrigatória: falha o build se args não foram passados
RUN test -n "$NEXT_PUBLIC_SUPABASE_URL" \
    && test -n "$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" \
    && test -n "$NEXT_PUBLIC_APP_URL" \
    || (echo "ERROR: NEXT_PUBLIC_* build-args são obrigatórios." && exit 1)

RUN pnpm run build

# ── Stage 4: runner ───────────────────────────────────────────────────────────
# Imagem final mínima: sem node_modules de dev, sem source code, sem cache.
# Usa o output standalone do Next.js (configurado em next.config.ts).
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Usuário não-root por segurança (sem privilégios de sistema)
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]
```

**Requisito no `next.config.ts`:**
```typescript
const nextConfig: NextConfig = {
  output: "standalone",  // Gera .next/standalone — necessário para este Dockerfile
};
```

### FastAPI — Dockerfile multi-stage otimizado

```dockerfile
# ── Stage 1: builder ──────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

# Instala dependências de build separadas do runtime
RUN pip install --upgrade pip

# Copia só os arquivos de dependência primeiro (cache de camadas)
COPY requirements.txt .

# --no-cache-dir reduz tamanho da imagem
# --prefix instala em /install para copiar no stage final
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Stage 2: runner ───────────────────────────────────────────────────────────
FROM python:3.12-slim AS runner

WORKDIR /app

# Copia dependências instaladas do stage anterior
COPY --from=builder /install /usr/local

# Copia o código da aplicação
COPY . .

# Usuário não-root por segurança
RUN addgroup --system --gid 1001 appgroup \
    && adduser --system --uid 1001 --gid 1001 appuser

# Variáveis de ambiente de runtime (valores reais vêm do Cloud Run)
ENV PORT=8080
ENV HOST=0.0.0.0
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

USER appuser
EXPOSE 8080

# uvicorn com workers para produção
# --workers 1 no Cloud Run (cada instância = 1 container)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1"]
```

### .dockerignore — essencial para builds rápidos

**Next.js (`.dockerignore`):**
```
node_modules
.next
.git
.env
.env.local
.env.*.local
*.md
.gitignore
```

**FastAPI (`.dockerignore`):**
```
__pycache__
*.pyc
*.pyo
.git
.env
.env.*
.venv
venv
*.md
.gitignore
.pytest_cache
tests/
```

---

## 7. cloudbuild.yaml — Referência Completa

### Estrutura geral e conceitos

```yaml
# substitutions: variáveis configuráveis no trigger ou passadas via --substitutions
# Prefixo _ é obrigatório para substitutions customizadas.
substitutions:
  _REGION: us-central1
  _VAR_COM_DEFAULT: "valor-padrao"
  _VAR_OBRIGATORIA: ""          # vazio = obrigatório validar no step validate

# availableSecrets: declara secrets do Secret Manager para uso nos steps
# O valor é exposto via secretEnv nos steps (nunca como ARG direto).
availableSecrets:
  secretManager:
    - versionName: projects/$PROJECT_ID/secrets/NOME_SECRET/versions/latest
      env: NOME_NO_BUILD           # nome da variável dentro do step

steps:
  - id: nome-do-step              # identificador para waitFor
    name: imagem-docker           # container que executa este step
    entrypoint: bash              # opcional: sobrescreve o entrypoint da imagem
    args:
      - -c
      - |
        comandos aqui
    env:                          # variáveis de ambiente do step
      - "VARIAVEL=valor"
    secretEnv:                    # secrets declarados em availableSecrets
      - NOME_NO_BUILD
    waitFor:                      # dependências (execução paralela se omitido)
      - outro-step
    timeout: 600s                 # timeout do step (padrão: 600s)

# images: imagens a serem publicadas no Artifact Registry após o build
images:
  - "REGION-docker.pkg.dev/PROJECT_ID/REPO/IMAGE:TAG"

options:
  logging: CLOUD_LOGGING_ONLY    # logs no Cloud Logging (não no GCS)
  machineType: E2_HIGHCPU_8      # opcional: máquina mais potente para builds pesados
```

### Variáveis de ambiente automáticas do Cloud Build

| Variável | Valor | Exemplo |
|----------|-------|---------|
| `$PROJECT_ID` | ID do projeto GCP | `caldas-projects-dev` |
| `$BUILD_ID` | UUID do build | `abc123-...` |
| `$COMMIT_SHA` | SHA completo do commit | `a1b2c3d4e5...` |
| `$SHORT_SHA` | 7 primeiros chars do SHA | `a1b2c3d` |
| `$BRANCH_NAME` | Branch que disparou o trigger | `main` |
| `$TAG_NAME` | Tag Git (se trigger por tag) | `v1.0.0` |
| `$REPO_NAME` | Nome do repositório | `passanota-web` |
| `$TRIGGER_NAME` | Nome do trigger | `passanota-web-main` |

### cloudbuild.yaml — Next.js (completo e comentado)

```yaml
substitutions:
  _REGION: us-central1
  _AR_REPOSITORY: passanota-images
  _IMAGE_NAME: passanota-web
  _SERVICE_NAME: passanota-web
  _TAG: latest
  # Estas três são obrigatórias — o step validate falhará se vazias
  _PASSANOTA_API_URL: ""
  _SUPABASE_URL: ""
  _APP_URL: ""
  _MIN_INSTANCES: "0"
  # Nome do secret no Secret Manager (parametrizável por ambiente)
  _SECRET_SUPABASE_PUBLISHABLE_KEY: PASSANOTA_SUPABASE_PUBLISHABLE_KEY

availableSecrets:
  secretManager:
    - versionName: projects/$PROJECT_ID/secrets/${_SECRET_SUPABASE_PUBLISHABLE_KEY}/versions/latest
      env: SUPABASE_PUBLISHABLE_KEY

steps:
  # ── Step 1: Validação ──────────────────────────────────────────────────────
  # Valida substitutions obrigatórias e existência do secret ANTES de gastar
  # tempo com lint/build. Falha rápido = economia de tempo e $$.
  - id: validate
    name: gcr.io/google.com/cloudsdktool/cloud-sdk:slim
    entrypoint: bash
    args:
      - -c
      - |
        set -euo pipefail
        # Validar substitutions obrigatórias
        if [ -z "${_PASSANOTA_API_URL}" ] || [ -z "${_SUPABASE_URL}" ] || [ -z "${_APP_URL}" ]; then
          echo "ERROR: Configure _PASSANOTA_API_URL, _SUPABASE_URL e _APP_URL."
          exit 1
        fi
        # Detectar valores placeholder
        case "${_APP_URL}" in
          *XXXX*|*"[project-ref]"*|*placeholder*)
            echo "ERROR: _APP_URL parece ser placeholder: ${_APP_URL}"
            exit 1
          ;;
        esac
        # Verificar que o secret existe no Secret Manager
        gcloud secrets describe "${_SECRET_SUPABASE_PUBLISHABLE_KEY}" \
          --project="$PROJECT_ID" >/dev/null
        echo "✓ Validation OK (commit: $COMMIT_SHA)"

  # ── Step 2: Lint e typecheck ───────────────────────────────────────────────
  # Roda em paralelo conceptualmente com outros steps independentes,
  # mas waitFor: [validate] garante que só começa se a validação passar.
  - id: lint
    name: node:22-alpine
    entrypoint: sh
    args:
      - -c
      - |
        set -e
        corepack enable && corepack prepare pnpm@8.15.9 --activate
        pnpm install --frozen-lockfile
        pnpm lint
        pnpm typecheck
    waitFor: [validate]

  # ── Step 3: Docker build ───────────────────────────────────────────────────
  # secretEnv expõe o secret como variável de ambiente $$NOME (note o $$).
  # O $$ é necessário para o Cloud Build não interpretar como substitution.
  - id: build
    name: gcr.io/cloud-builders/docker
    secretEnv: [SUPABASE_PUBLISHABLE_KEY]
    args:
      - build
      - -t
      - ${_REGION}-docker.pkg.dev/$PROJECT_ID/${_AR_REPOSITORY}/${_IMAGE_NAME}:${_TAG}
      - -t
      - ${_REGION}-docker.pkg.dev/$PROJECT_ID/${_AR_REPOSITORY}/${_IMAGE_NAME}:latest
      # --build-arg passa valores para os ARGs do Dockerfile
      - --build-arg
      - NEXT_PUBLIC_SUPABASE_URL=${_SUPABASE_URL}
      - --build-arg
      # $$VARIAVEL = referência ao secretEnv (dois $$ = um $ literal no shell)
      - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$$SUPABASE_PUBLISHABLE_KEY
      - --build-arg
      - NEXT_PUBLIC_APP_URL=${_APP_URL}
      - .
    waitFor: [lint]

  # ── Step 4: Push para Artifact Registry ───────────────────────────────────
  - id: push
    name: gcr.io/cloud-builders/docker
    args:
      - push
      - --all-tags    # push de todas as tags criadas no build
      - ${_REGION}-docker.pkg.dev/$PROJECT_ID/${_AR_REPOSITORY}/${_IMAGE_NAME}
    waitFor: [build]

  # ── Step 5: Deploy no Cloud Run ───────────────────────────────────────────
  - id: deploy
    name: gcr.io/google.com/cloudsdktool/cloud-sdk:slim
    entrypoint: gcloud
    args:
      - run
      - deploy
      - ${_SERVICE_NAME}
      - --image
      - ${_REGION}-docker.pkg.dev/$PROJECT_ID/${_AR_REPOSITORY}/${_IMAGE_NAME}:${_TAG}
      - --region
      - ${_REGION}
      - --platform
      - managed
      - --allow-unauthenticated   # frontend público
      - --port
      - "8080"
      - --memory
      - 512Mi
      - --cpu
      - "1"
      - --timeout
      - "60"
      - --min-instances
      - ${_MIN_INSTANCES}
      - --max-instances
      - "5"
      # ^|^ como delimitador quando valores contêm vírgulas ou =
      - --set-env-vars
      - ^|^NODE_ENV=production|PASSANOTA_API_URL=${_PASSANOTA_API_URL}|SUPABASE_URL=${_SUPABASE_URL}|NEXT_PUBLIC_SUPABASE_URL=${_SUPABASE_URL}|NEXT_PUBLIC_APP_URL=${_APP_URL}
      # Monta secrets como variáveis de ambiente em runtime
      - --set-secrets
      - SUPABASE_PUBLISHABLE_KEY=${_SECRET_SUPABASE_PUBLISHABLE_KEY}:latest,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${_SECRET_SUPABASE_PUBLISHABLE_KEY}:latest
    waitFor: [push]

images:
  - ${_REGION}-docker.pkg.dev/$PROJECT_ID/${_AR_REPOSITORY}/${_IMAGE_NAME}:${_TAG}
  - ${_REGION}-docker.pkg.dev/$PROJECT_ID/${_AR_REPOSITORY}/${_IMAGE_NAME}:latest

options:
  logging: CLOUD_LOGGING_ONLY
```

### cloudbuild.yaml — FastAPI (completo e comentado)

```yaml
substitutions:
  _REGION: us-central1
  _AR_REPOSITORY: passanota-images
  _IMAGE_NAME: passanota-api
  _SERVICE_NAME: passanota-api
  _TAG: latest
  _FRONTEND_URL: ""
  _MIN_INSTANCES: "0"
  # Secrets individuais parametrizados
  _SECRET_DATABASE_URL: PASSANOTA_DATABASE_URL
  _SECRET_JWT_SECRET: PASSANOTA_JWT_SECRET

availableSecrets:
  secretManager:
    - versionName: projects/$PROJECT_ID/secrets/${_SECRET_DATABASE_URL}/versions/latest
      env: DATABASE_URL
    - versionName: projects/$PROJECT_ID/secrets/${_SECRET_JWT_SECRET}/versions/latest
      env: JWT_SECRET

steps:
  - id: validate
    name: gcr.io/google.com/cloudsdktool/cloud-sdk:slim
    entrypoint: bash
    args:
      - -c
      - |
        set -euo pipefail
        [ -n "${_FRONTEND_URL}" ] || (echo "ERROR: _FRONTEND_URL obrigatório" && exit 1)
        gcloud secrets describe "${_SECRET_DATABASE_URL}" --project="$PROJECT_ID" >/dev/null
        gcloud secrets describe "${_SECRET_JWT_SECRET}" --project="$PROJECT_ID" >/dev/null
        echo "✓ Validation OK"

  # Para Python: lint com ruff, typecheck com mypy
  - id: lint
    name: python:3.12-slim
    entrypoint: bash
    args:
      - -c
      - |
        set -e
        pip install --quiet ruff mypy
        ruff check .
        mypy app/ --ignore-missing-imports
    waitFor: [validate]

  - id: build
    name: gcr.io/cloud-builders/docker
    args:
      - build
      - -t
      - ${_REGION}-docker.pkg.dev/$PROJECT_ID/${_AR_REPOSITORY}/${_IMAGE_NAME}:${_TAG}
      - -t
      - ${_REGION}-docker.pkg.dev/$PROJECT_ID/${_AR_REPOSITORY}/${_IMAGE_NAME}:latest
      - .
    waitFor: [lint]

  - id: push
    name: gcr.io/cloud-builders/docker
    args: [push, --all-tags, "${_REGION}-docker.pkg.dev/$PROJECT_ID/${_AR_REPOSITORY}/${_IMAGE_NAME}"]
    waitFor: [build]

  - id: deploy
    name: gcr.io/google.com/cloudsdktool/cloud-sdk:slim
    entrypoint: gcloud
    args:
      - run
      - deploy
      - ${_SERVICE_NAME}
      - --image
      - ${_REGION}-docker.pkg.dev/$PROJECT_ID/${_AR_REPOSITORY}/${_IMAGE_NAME}:${_TAG}
      - --region
      - ${_REGION}
      - --platform
      - managed
      - --no-allow-unauthenticated  # API privada: só o frontend com IAM pode chamar
      - --port
      - "8080"
      - --memory
      - 512Mi
      - --cpu
      - "1"
      - --min-instances
      - ${_MIN_INSTANCES}
      - --max-instances
      - "10"
      - --set-env-vars
      - FRONTEND_URL=${_FRONTEND_URL}
      # Secrets montados em runtime — valores NUNCA aparecem em logs
      - --set-secrets
      - DATABASE_URL=${_SECRET_DATABASE_URL}:latest,JWT_SECRET=${_SECRET_JWT_SECRET}:latest
    waitFor: [push]

images:
  - ${_REGION}-docker.pkg.dev/$PROJECT_ID/${_AR_REPOSITORY}/${_IMAGE_NAME}:${_TAG}
  - ${_REGION}-docker.pkg.dev/$PROJECT_ID/${_AR_REPOSITORY}/${_IMAGE_NAME}:latest

options:
  logging: CLOUD_LOGGING_ONLY
```

---

## 8. Builds Locais e Manuais via CLI

### Build Docker local (sem GCP)

```powershell
# ── Next.js ───────────────────────────────────────────────────────────────────
# Lendo secrets do .env.local para não digitar na linha de comando
$env_file = Get-Content .env.local | Where-Object { $_ -match "=" -and $_ -notmatch "^#" }
$env_map = @{}
$env_file | ForEach-Object { $k, $v = $_ -split "=", 2; $env_map[$k.Trim()] = $v.Trim() }

docker build `
  --build-arg "NEXT_PUBLIC_SUPABASE_URL=$($env_map['NEXT_PUBLIC_SUPABASE_URL'])" `
  --build-arg "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$($env_map['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'])" `
  --build-arg "NEXT_PUBLIC_APP_URL=http://localhost:3000" `
  -t passanota-web:local .

# Rodar localmente (runtime envs separados de build-args)
docker run --rm -p 8080:8080 `
  -e PASSANOTA_API_URL=http://host.docker.internal:8000 `
  -e PASSANOTA_API_USE_IAM=false `
  -e SUPABASE_URL=$($env_map['NEXT_PUBLIC_SUPABASE_URL']) `
  passanota-web:local

# ── FastAPI ───────────────────────────────────────────────────────────────────
docker build -t passanota-api:local .

docker run --rm -p 8000:8080 `
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" `
  -e JWT_SECRET="segredo-local" `
  -e FRONTEND_URL="http://localhost:3000" `
  passanota-api:local
```

### gcloud builds submit — build manual no Cloud Build (sem trigger)

```powershell
# Build + deploy com substitutions completas
gcloud builds submit `
  --project=caldas-projects-dev `
  --config=cloudbuild.yaml `
  --substitutions="_TAG=$SHORT_SHA,_PASSANOTA_API_URL=https://passanota-api-XXXX.run.app,_SUPABASE_URL=https://ref.supabase.co,_APP_URL=https://passanota-web-XXXX.run.app"

# Especificando a tag como a data atual (útil para hotfixes)
$TAG = (Get-Date -Format "yyyy-MM-dd-HHmm")
gcloud builds submit `
  --project=caldas-projects-dev `
  --config=cloudbuild.yaml `
  --substitutions="_TAG=$TAG,_PASSANOTA_API_URL=https://passanota-api-XXXX.run.app,_SUPABASE_URL=https://ref.supabase.co,_APP_URL=https://passanota-web-XXXX.run.app"

# Só lint/typecheck (usando o PR config)
gcloud builds submit `
  --project=caldas-projects-dev `
  --config=cloudbuild.pr.yaml

# Sem upload do source (se quiser usar source de um branch específico via trigger)
gcloud builds triggers run passanota-web-main `
  --branch=main `
  --region=us-central1 `
  --project=caldas-projects-dev
```

### Cloud Build local com cloud-build-local (para debug)

> Requer Docker e o plugin `cloud-build-local` instalado.

```powershell
# Instalar o runner local
pip install cloud-build-local
# ou
gcloud components install cloud-build-local

# Executar localmente (--dryrun=false para executar de verdade)
cloud-build-local `
  --config=cloudbuild.yaml `
  --dryrun=false `
  --substitutions="_TAG=local-test" `
  .
```

---

## 9. Cheatsheet de Comandos Rápidos

### Artifact Registry

```powershell
# Criar repositório de imagens Docker
gcloud artifacts repositories create passanota-images `
  --repository-format=docker `
  --location=us-central1 `
  --description="Imagens do projeto Passanota" `
  --project=caldas-projects-dev

# Configurar Docker para autenticar no AR
gcloud auth configure-docker us-central1-docker.pkg.dev

# Listar imagens
gcloud artifacts docker images list `
  us-central1-docker.pkg.dev/caldas-projects-dev/passanota-images `
  --project=caldas-projects-dev

# Deletar imagem antiga
gcloud artifacts docker images delete `
  "us-central1-docker.pkg.dev/caldas-projects-dev/passanota-images/passanota-web:old-tag" `
  --project=caldas-projects-dev
```

### Logs e diagnósticos

```powershell
# Logs do Cloud Run em tempo real
gcloud run services logs tail passanota-web `
  --region=us-central1 `
  --project=caldas-projects-dev

# Logs com filtro (últimas 1 hora)
gcloud logging read `
  'resource.type="cloud_run_revision" AND resource.labels.service_name="passanota-web"' `
  --limit=50 `
  --freshness=1h `
  --format="value(textPayload)" `
  --project=caldas-projects-dev

# Status de build específico
gcloud builds describe BUILD_ID --project=caldas-projects-dev
```

### Permissões mínimas necessárias para o projeto funcionar

```powershell
$PROJECT = "caldas-projects-dev"
$PROJECT_NUMBER = gcloud projects describe $PROJECT --format="value(projectNumber)"
$CB_SA = "$PROJECT_NUMBER@cloudbuild.gserviceaccount.com"
$CR_SA = "$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

# Cloud Build: deploy, push de imagens, agir como SA do Cloud Run
gcloud projects add-iam-policy-binding $PROJECT `
  --member="serviceAccount:$CB_SA" --role="roles/run.admin"
gcloud projects add-iam-policy-binding $PROJECT `
  --member="serviceAccount:$CB_SA" --role="roles/artifactregistry.writer"
gcloud iam service-accounts add-iam-policy-binding $CR_SA `
  --member="serviceAccount:$CB_SA" `
  --role="roles/iam.serviceAccountUser" --project=$PROJECT

# Cloud Run SA: ler secrets em runtime
gcloud secrets add-iam-policy-binding PASSANOTA_SUPABASE_PUBLISHABLE_KEY `
  --member="serviceAccount:$CR_SA" `
  --role="roles/secretmanager.secretAccessor" --project=$PROJECT

# Cloud Build SA: ler secrets no build
gcloud secrets add-iam-policy-binding PASSANOTA_SUPABASE_PUBLISHABLE_KEY `
  --member="serviceAccount:$CB_SA" `
  --role="roles/secretmanager.secretAccessor" --project=$PROJECT
```

### Verificação rápida de saúde do projeto

```powershell
# Script de diagnóstico — rode para confirmar que tudo está OK
$PROJECT = "caldas-projects-dev"
$REGION  = "us-central1"

Write-Host "=== Serviços Cloud Run ===" -ForegroundColor Cyan
gcloud run services list --region=$REGION --project=$PROJECT --format="table(metadata.name, status.url, status.observedGeneration)"

Write-Host "`n=== Secrets ===" -ForegroundColor Cyan
gcloud secrets list --project=$PROJECT --format="table(name, createTime)"

Write-Host "`n=== Triggers Cloud Build ===" -ForegroundColor Cyan
gcloud builds triggers list --region=$REGION --project=$PROJECT --format="table(name, github.push.branch, filename)"

Write-Host "`n=== Último build ===" -ForegroundColor Cyan
gcloud builds list --limit=3 --project=$PROJECT --format="table(id, status, createTime, duration)"
```

---

## Conceitos e Pegadinhas Importantes

### Por que `NEXT_PUBLIC_*` precisa ser um `--build-arg` e não uma env var de runtime?

O Next.js substitui variáveis `NEXT_PUBLIC_*` **em tempo de compilação** (durante `next build`). O bundle JavaScript resultante já contém os valores hardcoded. Por isso:

- Valores `NEXT_PUBLIC_*` → precisam ser `ARG` + `ENV` no Dockerfile e `--build-arg` no `docker build`
- Valores de servidor (`NODE_ENV`, URLs de APIs internas) → podem ser env vars de runtime no Cloud Run

### Por que `$$VARIAVEL` no cloudbuild.yaml?

O Cloud Build faz substituição de texto em `$VARIAVEL` e `${VARIAVEL}`. Para referenciar uma variável de ambiente do próprio shell (como um `secretEnv`), é necessário escapar com `$$`:

```yaml
# ERRADO: Cloud Build tenta substituir como substitution e falha
- NEXT_PUBLIC_KEY=$SUPABASE_PUBLISHABLE_KEY

# CORRETO: $$ vira $ em runtime, referenciando a env var do container
- NEXT_PUBLIC_KEY=$$SUPABASE_PUBLISHABLE_KEY
```

### `--set-env-vars` com delimitador `^|^`

Por padrão, o `--set-env-vars` usa vírgula como delimitador. Se algum valor contiver vírgula, use `^DELIM^` para definir um delimitador customizado:

```bash
# Se algum valor tiver vírgula, use pipe como delimitador
--set-env-vars "^|^VAR1=valor,com,virgula|VAR2=normal"
```

### Secret no Cloud Build vs Secret no Cloud Run

| Onde | Como declarar | Como acessar |
|------|---------------|--------------|
| Cloud Build (build time) | `availableSecrets` + `secretEnv` | `$$NOME_VAR` no step |
| Cloud Run (runtime) | `--set-secrets` no deploy | `$NOME_VAR` na aplicação |

### `--allow-unauthenticated` requer permissão IAM

Em projetos com políticas organizacionais, `--allow-unauthenticated` pode ser bloqueado. Verifique:

```powershell
gcloud org-policies describe constraints/iam.allowedPolicyMemberDomains `
  --project=caldas-projects-dev
```

Se bloqueado, será necessário solicitar exceção ao administrador da organização ou usar domínio verificado.
