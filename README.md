# Ghost Assistant

Real-time collaborative system design workspace. Requires **Node.js 22** (`>=22.12.0 <23`, npm 10) — the same runtime used by CI, Docker, and the lockfile since Clerk was added.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

| Package | Why |
|---------|-----|
| **Next.js** + React | App, pages, API routes |
| **Clerk** (`@clerk/nextjs`, `@clerk/ui`) | Auth, route protection, collaborator identity |
| **Prisma** (`prisma`, `@prisma/client`) | Projects, ownership, collaborator metadata |
| **Postgres driver** (`@prisma/adapter-pg`, `pg`) | Direct `postgresql://` connections |
| **Prisma Accelerate** (`@prisma/extension-accelerate`) | Accelerate URL (`prisma+postgres://`) path in `lib/prisma.ts` |
| **dotenv** | Load `DATABASE_URL` for Prisma CLI / `prisma.config.ts` |
| **Liveblocks** (`@liveblocks/client`, `node`, `react`, `react-flow`, `react-ui`) | Real-time shared canvas, presence, cursors, room auth |
| **`liveblocks.config.ts`** | Typed Presence / Storage / UserMeta for Liveblocks |
| **React Flow** (`@xyflow/react`) | Canvas nodes and edges |
| **shadcn/ui** + Tailwind + Lucide | Editor UI primitives |
| **Vercel Blob** (`@vercel/blob`) | Canvas snapshots (specs later) |
| **Trigger.dev** (`@trigger.dev/sdk`, `@trigger.dev/build`, `trigger.dev`) | Durable background tasks for AI generation |

**Planned:** AI architecture and spec generation tasks on Trigger.dev.

## Environment

| Variable | Why |
|----------|-----|
| `DATABASE_URL` | Prisma / Postgres (prefer `sslmode=verify-full`) |
| Clerk keys (`NEXT_PUBLIC_CLERK_*`, secret key) | Auth + `proxy.ts` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `SIGN_UP_URL` | Public auth paths |
| `LIVEBLOCKS_SECRET_KEY` | Server room auth (`/api/liveblocks-auth`) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob uploads for canvas snapshots |
| `TRIGGER_SECRET_KEY` | Authenticate the Next.js app with Trigger.dev (DEV key from the dashboard) |

## Agent skills

Installed under `.agents/skills/` (locked in `skills-lock.json`):

| Skill | Source | Why |
|-------|--------|-----|
| `prisma-cli` | `prisma/skills` | migrate, generate, studio, db |
| `prisma-client-api` | `prisma/skills` | Client CRUD / filters |
| `prisma-database-setup` | `prisma/skills` | DB provider setup |
| `prisma-postgres` | `prisma/skills` | Prisma Postgres ops |
| `prisma-postgres-setup` | `prisma/skills` | Connect Prisma Postgres to the app |
| `prisma-driver-adapter-implementation` | `prisma/skills` | `@prisma/adapter-pg` contracts |
| `prisma-upgrade-v7` | `prisma/skills` | Prisma 7 breaking changes |
| `prisma-compute` | `prisma/skills` | Compute deploy (pack; not primary yet) |
| `prisma-mongodb-upgrade` | `prisma/skills` | Mongo guide (pack; we use Postgres) |
| `liveblocks-best-practices` | `liveblocks/skills` | Rooms, auth, React Flow multiplayer |
| `trigger-authoring-tasks` | `@trigger.dev/sdk` | Background tasks (`trigger/`) |
| `trigger-authoring-chat-agent` | `@trigger.dev/sdk` | Durable `chat.agent` (later) |

```bash
npx skills add prisma/skills
npx skills add liveblocks/skills
npx skills add triggerdotdev/skills
```

### Troubleshooting

If the page hangs or won't load, a stuck `next dev` process may still be holding port 3000. Don't run `npm run dev` and Docker `app-dev` at the same time.

```bash
pkill -f "next dev"
npm run dev
```

If Turbopack panics with `Permission denied` writing under `.next` (often `_document.js` / `_error.js`), the cache was created by Docker or a root process. Stop `next dev`, delete it, and start again:

```bash
rm -rf .next .next.stale-*
npm run dev
```

If `rm` fails with `Permission denied`, run the same commands with `sudo`.

## Docker

### Production

```bash
docker compose up --build
```

### Development

```bash
docker compose --profile dev up app-dev
```

Requires Node 22 (`>=22.12.0 <23`, npm 10) and `.env.local` for Clerk. Run npm/Prisma **inside the container** when using Docker dev (see [Prisma](#prisma)). Use `nvm use` (reads `.nvmrc`) so local installs do not rewrite the lockfile with Node 24 / npm 11.

## Prisma

PostgreSQL via [Prisma 7](https://www.prisma.io/docs). Client output: `app/generated/prisma` (gitignored — run `prisma generate` after clone).

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=verify-full"
```

Set in `.env` (Prisma CLI) and `.env.local` (Next.js). Prefer `sslmode=verify-full` for hosted Postgres.

### Initial setup (one-time)

```bash
npm install prisma tsx @types/pg --save-dev
npm install @prisma/client @prisma/adapter-pg @prisma/extension-accelerate dotenv pg
npx prisma init --output ../app/generated/prisma
npx prisma generate
npx skills add prisma/skills
```

Docker: prefix with `docker compose --profile dev run --rm app-dev`.

### Day-to-day

```bash
npx prisma generate
npx prisma migrate dev
npx prisma studio
```

## Trigger.dev

Durable background jobs live in `trigger/` and are configured by `trigger.config.ts` (Node 22 worker, project ref from the dashboard). The Next.js `dev` script stays Next-only so Docker `app-dev` is unchanged.

```bash
npm run trigger:dev
npm run trigger:deploy
```

`trigger:dev` watches `trigger/` and registers tasks with the Trigger.dev dashboard. Product tasks are `generate-architecture` and `generate-spec`. Set `TRIGGER_SECRET_KEY` in `.env.local` before triggering runs from the Next.js app. Use Node 22 (`nvm use`) so the local CLI matches `runtime: "node-22"`.

## CI/CD

GitHub Actions: lint + build on push/PR; on `main`, push image to `ghcr.io/pdldipak/ghost-assistant`.
