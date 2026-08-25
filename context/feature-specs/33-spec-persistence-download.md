Persist generated specs with Vercel Blob and Prisma, then add a secure download route so members can retrieve their Markdown files.

This unit is backend only. The Specs tab stays a visual placeholder. Do not add frontend wiring, a spec editor, or a specs list UI.

`generate-spec` already returns `{ title, spec }` Markdown and does not persist. There is no `ProjectSpec` model. Canvas persistence already uses Vercel Blob (`lib/canvas-blob.ts`) with Prisma storing only the blob URL on `canvasJsonPath`. Specs must follow that metadata + blob pattern. Architecture path for spec files is `specs/{projectId}/{specId}.md`.

`@vercel/blob` and `BLOB_READ_WRITE_TOKEN` are already installed. Do not add a second blob package or token name. Do not invent a second project ID: in this app the Liveblocks room ID is the project ID.

Before writing Prisma or Trigger.dev code, load the `prisma-cli` and `prisma-client-api` skills, the `trigger-authoring-tasks` skill, and the version-pinned SDK docs under `node_modules/@trigger.dev/sdk`. This is still a `task()`, not `chat.agent`.

## Before implementing

- Read `context/project-overview.md`, `context/architecture-context.md`, and `context/code-standards.md`.
- Inspect `prisma/models/project.prisma`, `prisma/models/task-run.prisma`, `lib/canvas-blob.ts`, `lib/canvas-snapshot.ts` (`isStoredBlobUrl`), `lib/prisma.ts`, `lib/project-access.ts`, `trigger/generate-spec.ts`, `app/api/ai/spec/route.ts`, and `app/api/projects/[projectId]/canvas/route.ts`.
- Reuse `getClerkIdentity`, `getAccessibleProject`, `prisma`, `BLOB_READ_WRITE_TOKEN`, and the canvas blob access loop (try `private` then `public`).
- Do not store spec Markdown in Prisma. Do not expose blob URLs to the client.
- Do not modify `lib/canvas-blob.ts`, canvas routes, or `components/ui/*`.

## Implementation

1. Add a `ProjectSpec` model.

   Prisma already uses a multi-file schema under `prisma/`. Add `prisma/models/project-spec.prisma` (same split as `task-run.prisma`).

   Fields:
   - `id` — `cuid()` primary key
   - `projectId` — required, relation to `Project` with `onDelete: Cascade`
   - `filePath` — blob URL (or a non-URL placeholder until upload succeeds)
   - `createdAt`

   Indexes:
   - compound index on `projectId` and `createdAt`

   Add the reverse `specs` relation on `Project` in `prisma/models/project.prisma`. Do not add `title`, body, status, or other extra fields. Markdown lives in Blob; Prisma is metadata only.

   Run the Prisma migration and generate the client.

2. Add a spec Blob helper in `lib/spec-blob.ts`.

   Mirror `lib/canvas-blob.ts`. Do not reuse that file for spec uploads.

   - pathname: `specs/{projectId}/{specId}.md` (matches architecture-context)
   - `put` with `addRandomSuffix: false`, `allowOverwrite: true`, `contentType: "text/markdown"`
   - try `access: "private"` then `"public"` so either store type works
   - pass `BLOB_READ_WRITE_TOKEN` the same way canvas does
   - upload the Markdown string
   - return the blob `url`
   - fetch Markdown from a stored blob URL for the download route
   - treat non-`http(s)` `filePath` values as “not uploaded yet” (`isStoredBlobUrl`)

3. Persist inside `trigger/generate-spec.ts` after Gemini returns Markdown.

   Keep task id `generate-spec`, payload, retries, Liveblocks read, and Gemini prompts unchanged. Persistence is an extra step after a non-empty `spec` string exists.

   - reuse `prisma` from `lib/prisma.ts` (lazy client). Do not add a Prisma worker extension in `trigger.config.ts` unless the existing client cannot run in the worker
   - `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` must be available to the Trigger.dev worker, same as other server secrets
   - create a `ProjectSpec` row linked to `projectId` (the resolved room / project id)
   - upload Markdown to `specs/{projectId}/{specId}.md`
   - store the returned blob URL on `ProjectSpec.filePath`
   - if Blob or Prisma fails, abort with `AbortTaskRunError` so the run is retried — do not return success without a stored blob URL
   - persist empty-canvas notes too; they are still generated specs
   - do not mutate the canvas, publish `ai-status`, or write canvas blobs

   Keep returning `{ title, spec }`. Also include `specId` so a later frontend can download without listing. Do not return `filePath` or the blob URL.

4. Add `GET /api/projects/[projectId]/specs/[specId]/download`.

   Create `app/api/projects/[projectId]/specs/[specId]/download/route.ts`.

   Follow existing route patterns: `params` is `Promise<{ projectId: string; specId: string }>`, Clerk auth, `getAccessibleProject`.

   Access:
   - unauthenticated → `401`
   - missing/unauthorized project → `404` (same as canvas GET; do not leak whether the project exists)
   - spec missing, `filePath` not an `http(s)` URL, or spec `projectId` does not match the route → `404`
   - owner **or** collaborator may download

   Behavior:
   - look up the `ProjectSpec` by `specId` **and** `projectId`
   - fetch Markdown with the spec blob helper using `filePath`
   - return the file as a downloadable Markdown attachment (`Content-Type: text/markdown`, `Content-Disposition: attachment; filename="{specId}.md"`)
   - stream the file body; do not put the blob URL in JSON or headers
   - blob fetch failure → `502`

   Do not add a specs list route in this unit.

## Storage Pattern

- Prisma stores spec metadata (`ProjectSpec`) and the blob URL in `filePath`.
- Vercel Blob stores the Markdown at `specs/{projectId}/{specId}.md`.
- `generate-spec` remains the producer of the Markdown; Blob is the durable file; the download route is the only read path.

## Scope Limits

- don't add frontend logic, Specs-tab wiring, or a spec editor
- don't store spec content in Prisma
- don't expose Blob URLs without access checks (do not return them from the task or the download route)
- don't modify existing canvas persistence (`lib/canvas-blob.ts`, canvas routes, `canvasJsonPath`)
- don't mutate the canvas
- don't publish `ai-status` or AI presence
- don't add `chat.agent`, Zod, a second spec task file, or a specs list API
- don't import a Trigger.dev task instance into Next.js routes
- don't modify `components/ui/*`

## Check When Done

- `ProjectSpec` exists in Prisma with `projectId`, `filePath`, `createdAt`, cascade delete, and `(projectId, createdAt)` index.
- `generate-spec` uploads Markdown to Vercel Blob, stores the URL on `ProjectSpec.filePath`, and returns `{ title, spec, specId }` without the blob URL.
- `GET /api/projects/[projectId]/specs/[specId]/download` is membership-gated, verifies the spec belongs to that project, and returns a Markdown attachment.
- Canvas persistence, Architect, Chat, and the Specs tab UI are unchanged.
- `npm run lint` and typecheck pass.
