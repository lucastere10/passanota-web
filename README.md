# PassaNota Web

Frontend Next.js para controle de custos via leitura de notas fiscais com IA, integrado com a [passanota-api](../passanota-api).

## Requisitos

- Node.js 20+
- passanota-api rodando em `http://localhost:8000`

## Setup

1. Configure a API (backend) — veja [passanota-api/README.md](../passanota-api/README.md)

2. Configure o frontend:

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

Acesse http://localhost:3000

## Páginas

| Rota | Descrição |
|------|-----------|
| `/dashboard` | Métricas, gráficos e notas recentes |
| `/scan` | Captura de foto da nota fiscal |
| `/notas` | Lista paginada de notas |
| `/notas/[id]` | Detalhe com itens |
| `/busca` | Busca semântica (pgvector) |

## Arquitetura

- **Next.js App Router** + shadcn/ui
- **BFF proxy** em `/api/proxy/*` — repassa Bearer, `X-Empresa-Id` e `X-Device-Token` para a API
- Tema **light/dark** com paleta sóbria e destaque teal

## Variáveis

| Variável | Descrição |
|----------|-----------|
| `PASSANOTA_API_URL` | URL da API (padrão: `http://localhost:8000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_...`) |
| `NEXT_PUBLIC_APP_URL` | URL do frontend (redirects de magic link) |

## Deploy (Cloud Run)

Ver [docs/DEPLOY-GCP.md](docs/DEPLOY-GCP.md).
