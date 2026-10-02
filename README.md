# Finance Manager Frontend

Next.js static client for the Nest finance-manager API. Deploys to **GitHub Pages**.

## Local setup

```bash
cp .env.example .env.local
pnpm install
pnpm dev -- -p 3001
```

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Do **not** set `NEXT_PUBLIC_BASE_PATH` locally (empty = root).

## Scripts

| Script | Command |
|--------|---------|
| lint | `pnpm lint` |
| test | `pnpm test` |
| build | `pnpm build` → static files in `out/` |

## GitHub Pages (CD)

Site URL after deploy:

`https://nikita-merzlikin.github.io/financeManager_frontend/`

### 1. Repo → Settings → Pages

- **Source:** GitHub Actions

### 2. Repo → Settings → Secrets and variables → Actions

Create a **secret** (not variable):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | Production API URL, e.g. `https://api.your-domain.com` |

(This project is Next.js, so the name is `NEXT_PUBLIC_*`, not `VITE_*`.)

### 3. Push to `main`

Workflows:

- `.github/workflows/ci.yml` — lint / test / build
- `.github/workflows/deploy.yml` — build with base path + publish Pages

### 4. Backend CORS

Allow the Pages origin on Nest (`CORS_ORIGIN`), for example:

```env
CORS_ORIGIN=https://nikita-merzlikin.github.io,http://localhost:3001
```

Without this, the browser will block API calls from Pages.

### Notes

- Static export (`output: "export"`) — no Node server on Pages.
- `trailingSlash: true` — each route becomes `…/login/`, `…/dashboard/` (works on Pages without SPA rewrite).
- `NEXT_PUBLIC_BASE_PATH=/financeManager_frontend` is set only in **deploy** so assets load under the repo subpath.
