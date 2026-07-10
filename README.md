# ghost AI

Minimal Next.js app.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Troubleshooting

If the page hangs or won't load, a stuck `next dev` process may still be holding port 3000. Don't run `npm run dev` and Docker `app-dev` at the same time.

```bash
# Stop any stuck Next.js processes
pkill -f "next dev"

# Start fresh
npm run dev
```

## Docker

### Production

Builds the production image and runs the standalone Next.js server:

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000).

### Development

Runs `next dev` with hot reload. Source code is mounted from your machine:

```bash
docker compose --profile dev up app-dev
```

Open [http://localhost:3000](http://localhost:3000). The first start runs `npm ci` inside the container; later starts are faster. Requires Node 22+ (Clerk dependencies). Ensure `.env.local` exists on the host for Clerk keys.

Stop either mode with `Ctrl+C`, or run `docker compose down` in another terminal.

## CI/CD

GitHub Actions runs lint + build on every push/PR. On `main`, it also builds and pushes a Docker image to GitHub Container Registry (`ghcr.io/pdldipak/ghost-ai`).
