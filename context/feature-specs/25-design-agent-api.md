Set up the backend flow for design generation using Trigger.dev.

This unit handles triggering background jobs, tracking runs, and issuing run-scoped tokens. No AI logic, no canvas writes, and no UI.

Trigger.dev is already installed. `trigger.config.ts` points at `./trigger` with `runtime: "node-22"`. `trigger/generate-architecture.ts` already exists as a stub (`id: "generate-architecture"`, payload `{ projectId, prompt }`). There are no `/api/ai/*` routes and no `TaskRun` model.

Before writing Trigger.dev code, load the `trigger-authoring-tasks` skill and the version-pinned SDK docs under `node_modules/@trigger.dev/sdk`. Reuse that setup. Do not add `chat.agent` or a second design task file.

## Implementation

1. Add task run tracking.

   Create `prisma/models/task-run.prisma`. Prisma already uses a multi-file schema under `prisma/`. Add a `TaskRun` model so API routes can verify who started a Trigger.dev run before issuing a token.

   Fields:
   - `id` — `cuid()` primary key
   - `runId` — Trigger.dev run ID, unique
   - `projectId` — required, relation to `Project` with `onDelete: Cascade`
   - `userId` — Clerk user ID of the user who triggered the run
   - `createdAt`

   Indexes:
   - unique on `runId` (do not add a second index on the same field)
   - compound index on `userId` and `projectId`

   Add the reverse `taskRuns` relation on `Project` in `prisma/models/project.prisma`. Do not add status, task type, or other extra fields.

   Run the Prisma migration and generate the client.

2. Reuse the existing design task.

   Keep `trigger/generate-architecture.ts`. Do not create `trigger/design-agent.ts` or any other parallel design task.

   - keep task id `generate-architecture`
   - keep payload `{ projectId, prompt }`
   - `projectId` is the Liveblocks room ID in this app; do not add a separate `roomId` field
   - log or echo the input and return it
   - do not call AI providers, Liveblocks, Prisma, or Blob from the task

3. Add the design trigger route.

   Create `POST /api/ai/design` at `app/api/ai/design/route.ts`.

   Follow existing route patterns: Clerk auth, JSON body validation, `NextResponse.json`. Use `getClerkIdentity` and `getAccessibleProject` from `lib/project-access.ts`.

   Body: `{ prompt, projectId }`
   - `prompt` — non-empty string
   - `projectId` — non-empty string; this is also the room ID

   Access:
   - unauthenticated → `401`
   - missing/unauthorized project → `404` (same as canvas GET)
   - owner **or** collaborator may trigger

   If `TRIGGER_SECRET_KEY` is missing, return `500` with a clear message. Do not invent a second env var name.

   Trigger the task from the Next.js route with a type-only import plus `tasks.trigger`. Never import the task instance into the route.

   After Trigger.dev returns a run ID:
   - create a `TaskRun` row with that `runId`, the `projectId`, and the current Clerk `userId`
   - return immediately — do not wait for the job to finish

   Success response: `{ runId }`

4. Add the token route.

   Create `POST /api/ai/design/token` at `app/api/ai/design/token/route.ts`.

   Body: `{ runId }` — non-empty string.

   Access:
   - unauthenticated → `401`
   - no matching `TaskRun` for this `runId` **and** current `userId` → `404`
   - if that user no longer has project access → `404`

   Only the user who created the `TaskRun` can mint a token for it.

   Look up `auth.createPublicToken` in the installed SDK docs. Generate a public token scoped to that run ID only. Never return `TRIGGER_SECRET_KEY`. Never mint tokens in the client.

   Success response: `{ token }`

## Scope Limits

- don't generate nodes or edges
- don't call any AI providers
- don't update Liveblocks or the canvas
- don't add UI, React hooks, or AI sidebar wiring
- don't add `chat.agent`, Prisma worker extensions, or a second design task file
- don't import a Trigger.dev task instance into Next.js routes
- keep this focused on backend task wiring only

## Check When Done

- `POST /api/ai/design` is membership-gated, triggers `generate-architecture`, stores a `TaskRun`, and returns `{ runId }`.
- `TaskRun` exists in Prisma with unique `runId`, project relation, and `(userId, projectId)` index.
- `POST /api/ai/design/token` returns a run-scoped public token only to the user who owns that `TaskRun`.
- `trigger/generate-architecture.ts` still exists and remains a no-AI stub.
- `npm ci`, `npm run lint`, and `npm run build` pass.
