Create the backend flow for AI-powered spec generation: trigger route, token route, and a Trigger.dev task that turns the current canvas into Markdown.

This unit is backend only. The Specs tab stays a visual placeholder. Do not add frontend wiring, a spec editor, or download.

`TaskRun`, `createRunPublicToken`, and the design/chat trigger pattern already exist. `POST /api/ai/design` and `POST /api/ai/chat` authenticate with Clerk, resolve membership via `getAccessibleProject`, trigger a task with a type-only import plus `tasks.trigger`, store a `TaskRun`, and return `{ runId, publicToken }`. Spec generation should follow that loop.

There is no `/api/ai/spec` route yet. `trigger/generate-spec.ts` does not exist (only `generate-architecture` and `explain-architecture` are registered). There is no Prisma `Spec` model. Do not invent a second project ID: in this app the Liveblocks room ID is the project ID.

Before writing Trigger.dev code, load the `trigger-authoring-tasks` skill and the version-pinned SDK docs under `node_modules/@trigger.dev/sdk`. This is a `task()`, not `chat.agent`.

## Before implementing

- Read `context/project-overview.md`, `context/architecture-context.md`, and `context/ui-context.md`.
- Inspect `app/api/ai/design/route.ts`, `app/api/ai/chat/route.ts`, `app/api/ai/design/token/route.ts`, `lib/trigger-public-token.ts`, `trigger/explain-architecture.ts`, `lib/ai-canvas-snapshot.ts`, and `serializeCanvasForPrompt` in `lib/ai-canvas-plan.ts`.
- Reuse `getClerkIdentity`, `getAccessibleProject`, `TaskRun`, `createRunPublicToken`, Gemini (`GOOGLE_AI_API_KEY` then fallbacks), `readCanvasSnapshot`, and `serializeCanvasForPrompt`.
- Do not accept client-supplied `nodes` or `edges`. Read the Liveblocks graph in the worker.
- Do not modify `components/ui/*`.

## Implementation

1. Add `POST /api/ai/spec` at `app/api/ai/spec/route.ts`.

   Follow the design/chat route pattern: Clerk auth, JSON body validation, `NextResponse.json`.

   Body: `{ projectId }` (`roomId` is an allowed alias). Optional `history`: up to 8 `{ role, content }` turns, validated with `parseChatHistory` from `types/tasks.ts`.

   - `projectId` / `roomId` — non-empty string; this is also the Liveblocks room ID
   - do not accept a separate `projectId` plus `roomId` that disagree; resolve one id, then check membership
   - do not accept `nodes`, `edges`, or other canvas payloads from the client

   Access:
   - unauthenticated → `401`
   - missing/unauthorized project → `404`
   - owner **or** collaborator may trigger

   If `TRIGGER_SECRET_KEY` is missing, return `500` with a clear message.

   Trigger `generate-spec` with a type-only import plus `tasks.trigger`. Never import the task instance into the route.

   After Trigger.dev returns a run ID:
   - create a `TaskRun` row with that `runId`, the resolved `projectId`, and the current Clerk `userId`
   - mint a public token with `createRunPublicToken`
   - return immediately — do not wait for the job

   Success response: `{ runId, publicToken }`.

2. Add `POST /api/ai/spec/token` at `app/api/ai/spec/token/route.ts`.

   Same access rules as `POST /api/ai/design/token`:

   Body: `{ runId }` — non-empty string.

   - unauthenticated → `401`
   - no matching `TaskRun` for this `runId` **and** current `userId` → `404`
   - if that user no longer has project access → `404`

   Only the user who created the `TaskRun` can mint a token. Reuse `createRunPublicToken`. Never return `TRIGGER_SECRET_KEY`. Never mint tokens in the client.

   Success response: `{ token }`.

3. Add `trigger/generate-spec.ts`.

   - Task id `generate-spec`
   - Payload `{ projectId }` (`roomId` alias allowed). Optional `history` as in chat
   - Retry `maxAttempts: 3`
   - Validate payload like `explain-architecture` (`AbortTaskRunError` on missing `projectId`). Do not add Zod; it is not used in this repo
   - Ensure the Liveblocks room exists with `getOrCreateRoom` (`defaultAccesses: []`)
   - Read the current canvas with `readCanvasSnapshot`. Serialize it with `serializeCanvasForPrompt`
   - Ask Gemini (`@ai-sdk/google`, `gemini-3.6-flash`, `generateText` from `lib/ai-sdk.ts`) for a Markdown technical spec of **this** graph
   - Log `projectId` and attempt number. Do not publish `ai-status` or AI presence (those lock Architect as “updating the canvas”)
   - Do not add, move, or delete nodes or edges

   Gemini prompt requirements:

   - System: Ghost Assistant as a senior software architect writing a durable technical spec from a collaborative canvas
   - Ground every component and flow in the canvas nodes and edge labels. Do not invent services that are not on the canvas
   - If the canvas is empty, return a short Markdown note that there is no design to specify yet. Do not invent a system
   - Use optional `history` only as discussion context; the graph is the source of truth
   - Output Markdown only (no JSON, no canvas operations, no internal implementation details)
   - Structure: title, overview, components, data flows, integrations, and open questions when the graph implies them
   - User-facing language. Do not mention Trigger.dev, Liveblocks, or prompt internals

   Return `{ title, spec }` as task output (`spec` is the full Markdown). If Gemini returns empty text, abort with `AbortTaskRunError`.

## Scope Limits

- don't add frontend logic, Specs-tab wiring, or a spec editor
- don't persist the spec to Prisma or Vercel Blob yet
- don't mutate the canvas
- don't publish `ai-status` or AI presence
- don't add `chat.agent`, Zod, or a second spec task file
- don't import a Trigger.dev task instance into Next.js routes
- don't modify `components/ui/*`

## Check When Done

- `POST /api/ai/spec` is membership-gated, triggers `generate-spec`, stores a `TaskRun`, and returns `{ runId, publicToken }`.
- `POST /api/ai/spec/token` returns a run-scoped public token only to the user who owns that `TaskRun`.
- `generate-spec` reads the Liveblocks canvas, asks Gemini for Markdown, and returns `{ title, spec }` without changing the graph.
- The Specs tab, Architect, and Chat behavior are unchanged.
- `npm run lint` and typecheck pass.
