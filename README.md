# Ghost Assistant

Real-time collaborative system design workspace. Requires **Node.js `>=22.12.0`**.

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

**Planned (not installed):** Trigger.dev (AI jobs).

## Environment

| Variable | Why |
|----------|-----|
| `DATABASE_URL` | Prisma / Postgres (prefer `sslmode=verify-full`) |
| Clerk keys (`NEXT_PUBLIC_CLERK_*`, secret key) | Auth + `proxy.ts` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `SIGN_UP_URL` | Public auth paths |
| `LIVEBLOCKS_SECRET_KEY` | Server room auth (`/api/liveblocks-auth`) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob uploads for canvas snapshots |

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

```bash
npx skills add prisma/skills
npx skills add liveblocks/skills
```

### Troubleshooting

If the page hangs or won't load, a stuck `next dev` process may still be holding port 3000. Don't run `npm run dev` and Docker `app-dev` at the same time.

```bash
pkill -f "next dev"
npm run dev
```

## Docker

### Production

```bash
docker compose up --build
```

### Development

```bash
docker compose --profile dev up app-dev
```

Requires Node 22+ and `.env.local` for Clerk. Run npm/Prisma **inside the container** when using Docker dev (see [Prisma](#prisma)).

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

## CI/CD

GitHub Actions: lint + build on push/PR; on `main`, push image to `ghcr.io/pdldipak/ghost-assistant`.
