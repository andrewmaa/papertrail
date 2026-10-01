# papertrail

Digitize paper records with Claude Vision and review them on the dashboard.

## Setup

1. Copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY`.
2. If your key is multi-workspace, also set `ANTHROPIC_WORKSPACE_ID` (Claude Console → Settings → Workspaces; looks like `wrkspc_…`).
3. Start the Vite app and Express API together:

```bash
npm run dev
```

Frontend is proxied to the API on port 3001. Use `npm run dev:web` or `npm run server` to run either side alone.
