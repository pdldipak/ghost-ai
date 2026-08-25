Wire the AI Architect sidebar to design generation so a prompt starts a durable run, collaborators see live status, and canvas updates arrive through Liveblocks.

This unit is frontend wiring plus a small trigger-response change. Do not add spec generation, canvas mutation from the client, or a second design task.

`POST /api/ai/design` already exists (`app/api/ai/design/route.ts`). It accepts `{ prompt, projectId }`, requires project membership, triggers `generate-architecture`, stores a `TaskRun`, and returns `{ runId }`. A separate `POST /api/ai/design/token` mints a run-scoped public token. The Architect tab already has a room-scoped `ai-chat` feed and composer lock while generation is active. Canvas nodes and edges already sync through `useLiveblocksFlow`. The missing piece is connecting submit → trigger → realtime run → assistant reply.

`@trigger.dev/react-hooks` is already installed. Load the `trigger-realtime-and-frontend` skill and the version-pinned docs under `node_modules/@trigger.dev/sdk` before using `useRealtimeRun`.

## Before implementing

- Read `context/project-overview.md`, `context/architecture-context.md`, and `context/ui-context.md`.
- Inspect `components/editor/ai-sidebar.tsx`, `hooks/use-ai-chat.ts`, `hooks/use-ai-status.ts`, `app/api/ai/design/route.ts`, `app/api/ai/design/token/route.ts`, and `trigger/generate-architecture.ts`.
- Keep chat on `ai-chat` and status on `ai-status-feed`. Do not mix the two.
- Do not write nodes or edges from the client. Liveblocks is the source of truth.

## Implementation

1. Return a run-scoped token from the design trigger.

   Extend `POST /api/ai/design` so the sidebar can subscribe in one round trip.

   - Keep the existing body: `{ prompt, projectId }` (`projectId` is the Liveblocks room ID).
   - Also accept `roomId` as an alias for `projectId` so dashboard tests and the original payload shape still work.
   - After creating the `TaskRun`, mint a public token scoped to that `runId` with `auth.createPublicToken` (same scopes as `/api/ai/design/token`).
   - Success response: `{ runId, publicToken }`.
   - Keep `/api/ai/design/token` as-is for later reuse.
   - Never return `TRIGGER_SECRET_KEY`. Never mint tokens in the client.

2. Submit from the Architect composer.

   On send (button or Enter, Shift+Enter still inserts a newline):

   - Trim the prompt. Do not send empty messages.
   - Push the user message to the existing `ai-chat` feed first.
   - Then `POST /api/ai/design` with `{ prompt, projectId }`.
   - Read `{ runId, publicToken }` from the response and store both in local React state.
   - Clear the composer after a successful send.
   - Show a small inline error (`text-state-error`) if chat send or the API call fails. Do not toast or block the whole sidebar.

   Pass `projectId` into `AiSidebar` from `EditorShell` (`activeProjectId`). The sidebar already sits inside `CanvasRoom`.

3. Track the Trigger.dev run in real time.

   Use `useRealtimeRun` from `@trigger.dev/react-hooks` with the stored `runId` and `accessToken: publicToken`.

   - Call the hook unconditionally. Pass `enabled: false` until both `runId` and `publicToken` exist so a missing token does not throw.
   - While the local run is submitting or active: disable the Architect composer and show a spinner on the send button. Keep tabs, Specs, history, and close usable.
   - Keep the existing room-wide composer lock (`useAiGenerationActive`) so collaborators stay locked even though they do not own the public token.
   - When the run reaches a terminal status (`COMPLETED`, `FAILED`, `CANCELED`, `CRASHED`, `SYSTEM_FAILURE`, `EXPIRED`, `TIMED_OUT`):
     - push a final assistant message to `ai-chat` (`role: "assistant"`, sender Ghost AI)
     - use the task `summary` on success, or a short failure note on error
     - reset loading and local run state
   - Type the hook with `typeof generateArchitecture` (type-only import). Do not import the task instance into client code.

4. Leave canvas updates to Liveblocks.

   Do not call `onNodesChange`, `onEdgesChange`, `mutateFlow`, or any canvas API from the sidebar. `generate-architecture` already writes the graph; `useLiveblocksFlow` already reflects those changes. AI presence (`cursor`, `isThinking`) and `ai-status` events already broadcast from the worker.

5. Show a compact status strip above the composer.

   Read the latest validated message from `ai-status-feed`.

   - Render a single-line strip above the Architect input only while a run is active (local Trigger.dev run **or** room generation via status/presence).
   - Use existing tokens (`text-ai-text`, `text-state-error`, `text-state-success`). Do not introduce new colors.
   - Keep the sidebar header status from feature 27. Do not render full feed history.

6. Professionalize the design prompts.

   Update the Gemini system prompt and the user-prompt template in `trigger/generate-architecture.ts` so the agent behaves like a senior software architect: incremental edits, readable layout, short component labels, and a user-facing `summary` suitable for the assistant chat bubble. Tighten the Architect starter chips in the sidebar to match that tone. Do not change the canvas operation schema.

## UI Details

- Use existing design tokens from `globals.css`. Do not introduce new colors or raw Tailwind palette classes.
- Follow `ui-context.md` for layout, radius, and typography.
- Reuse shadcn `Button`, `Textarea`, and `ScrollArea`. Do not modify `components/ui/*`.

## Scope Limits

- don't mutate nodes or edges from the client
- don't add spec generation, Prisma models, Blob storage, or chat persistence
- don't add Liveblocks Feeds/Inbox, Comments, Presence keys, or Storage keys
- don't import a Trigger.dev task instance into Next.js routes or client components
- don't remove `/api/ai/design/token`
- don't modify `components/ui/*`
- keep this focused on wiring Architect submit to the existing design run

## Check When Done

- Architect submit broadcasts the user message, triggers `POST /api/ai/design`, and tracks the run with `useRealtimeRun`.
- `POST /api/ai/design` returns `{ runId, publicToken }` after membership checks.
- The composer is locked while the run is active; a compact `ai-status-feed` strip appears above the input.
- A final assistant message is pushed to `ai-chat` when the run finishes; canvas updates still come only from Liveblocks.
- Gemini and sidebar starter prompts are professional and user-facing.
- `npm ci`, `npm run lint`, and `npm run build` pass.
