# papertrail

Digitize paper records with Claude Vision and review them on the dashboard. Uploads and extracted fields persist in PostgreSQL (Railway-friendly).

## Setup

1. Copy `.env.example` to `.env`.
2. Set `ANTHROPIC_API_KEY` (and `ANTHROPIC_WORKSPACE_ID` if your key is multi-workspace).
3. Set `DATABASE_URL` to a Postgres connection string:
   - **Railway:** add a Postgres plugin to your project, then copy `DATABASE_URL` from the plugin variables. Keep `DATABASE_SSL=true`.
   - **Local:** point at a local Postgres instance and set `DATABASE_SSL=false` if it does not use SSL.
4. Start the Vite app and Express API together:

```bash
npm run dev
```

On first boot the API creates tables. Uploaded page images are stored as BYTEA in `record_pages` and served from `/api/pages/:id`.

Frontend is proxied to the API on port 3001. Use `npm run dev:web` or `npm run server` to run either side alone.

## Deploy

- **Railway (API + Postgres):** set `DATABASE_URL`, Anthropic keys, and `CORS_ORIGIN` to your Vercel domain(s), comma-separated.
- **Vercel (frontend):** set `VITE_API_URL` to your Railway public API URL (no trailing slash), e.g. `https://papertrail-api.up.railway.app`.
- Locally leave `VITE_API_URL` empty so Vite's `/api` proxy is used.
