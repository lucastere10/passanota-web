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
# PASSANOTA_API_KEY=<mesmo valor de API_KEY>
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
- **BFF proxy** em `/api/proxy/*` — injeta `X-API-Key` e repassa multipart para captura de fotos
- Tema **light/dark** com paleta sóbria e destaque teal

## Variáveis

| Variável | Descrição |
|----------|-----------|
| `PASSANOTA_API_URL` | URL da API (padrão: `http://localhost:8000`) |
| `PASSANOTA_API_KEY` | Chave da API do projeto (`API_KEY` no backend) — **não** é a chave do LLM |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_...`) |
