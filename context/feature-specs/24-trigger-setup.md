# Trigger.dev Background Task Infrastructure

Finish Trigger.dev setup so durable AI work can run outside Next.js request handlers.

The SDK packages and a root `trigger.config.ts` already exist from a partial CLI init. Tasks currently point at `./src/trigger`, the worker runtime is Node 24, and README still lists Trigger.dev as planned. This project uses Node 22 and keeps background jobs in `trigger/`.

Do not add AI generation, chat agents, Prisma worker extensions, React hooks, or public trigger API routes.

## Configuration

Update `trigger.config.ts`:

- keep the existing project ref
- set `dirs` to `["./trigger"]`
- set `runtime` to `"node-22"` to match `.nvmrc` and `package.json` engines
- keep existing retry defaults and `maxDuration`

Remove `src/trigger`. This app does not use a `src/` tree.

## Task directory

Keep `trigger/` in the repo for product jobs. Do not add a hello-world or other sample task.

`trigger:dev` requires product `*.ts` task files under `./trigger`. Add:

- `trigger/generate-architecture.ts` — id `generate-architecture`, payload `{ projectId, prompt }`
- `trigger/generate-spec.ts` — id `generate-spec`, payload `{ projectId }`

Do not call models, Liveblocks, Prisma, or Blob yet — that belongs in later AI generation features.

Architecture generation and spec generation behavior are later feature units.

## Scripts and CLI

Pin the `trigger.dev` CLI to the same version as `@trigger.dev/sdk` / `@trigger.dev/build`.

Add scripts without changing `npm run dev` (Docker `app-dev` and local Next.js stay Next-only):

- `trigger:dev` — local worker
- `trigger:deploy` — cloud deploy

## Environment

Document `TRIGGER_SECRET_KEY` in README. It authenticates the Next.js app so later API routes can call `tasks.trigger`. Do not commit secrets.

## Docs

- list Trigger.dev as installed in the README stack table
- add a short Trigger.dev section with local `trigger:dev` / `trigger:deploy` commands
- list Trigger.dev agent skills

## Check When Done

- tasks live under `trigger/`
- `trigger.config.ts` uses `node-22` and `./trigger`
- `npm ci`, `npm run lint`, and `npm run build` pass
- no unauthenticated route that triggers tasks
