# Ghost Assistant

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

When using Docker for dev, run npm and Prisma commands **inside the container** (see [Prisma](#prisma)) so `node_modules` stays in the Docker volume and you avoid root-owned files on the host.

## Prisma

PostgreSQL via [Prisma 7](https://www.prisma.io/docs). The generated client is written to `app/generated/prisma` (gitignored — run `prisma generate` after clone).

Set `DATABASE_URL` in `.env` (Prisma CLI) and `.env.local` (Next.js), for example:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=verify-full"
```

For hosted Postgres (including Prisma Postgres), use `sslmode=verify-full` so node-pg keeps current certificate verification without deprecation warnings. Avoid `sslmode=require` unless you also set `uselibpqcompat=true` and accept weaker libpq semantics.

### Initial setup (one-time)

Dependencies are already listed in `package.json`. To scaffold Prisma from scratch (or on a greenfield clone before the first commit), run:

```bash
npm install prisma tsx @types/pg --save-dev
npm install @prisma/client @prisma/adapter-pg dotenv pg
npx prisma init --output ../app/generated/prisma
npx prisma generate
npx skills add prisma/skills
```

Installs [Prisma agent skills](https://github.com/prisma/skills) for Cursor (project skills under `.agents/skills/`).

With Docker dev:

```bash
docker compose --profile dev run --rm app-dev npm install prisma tsx @types/pg --save-dev
docker compose --profile dev run --rm app-dev npm install @prisma/client @prisma/adapter-pg dotenv pg
docker compose --profile dev run --rm app-dev npx prisma init --output ../app/generated/prisma
docker compose --profile dev run --rm app-dev npx prisma generate
```

### Day-to-day

```bash
npx prisma generate          # Regenerate client after schema changes
npx prisma migrate dev       # Create and apply migrations (local dev)
npx prisma studio            # Browse data in the browser
```

Docker equivalents:

```bash
docker compose --profile dev run --rm app-dev npx prisma generate
docker compose --profile dev run --rm app-dev npx prisma migrate dev
docker compose --profile dev run --rm app-dev npx prisma studio
```

## CI/CD

GitHub Actions runs lint + build on every push/PR. On `main`, it also builds and pushes a Docker image to GitHub Container Registry (`ghcr.io/pdldipak/ghost-assistant`).
