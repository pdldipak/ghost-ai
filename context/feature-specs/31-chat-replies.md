Wire the Chat tab so a question about the canvas gets a Ghost AI reply in the shared `ai-chat` thread.

Chat currently broadcasts the user message and stops. There is no model call, so questions such as “can you explain about this design” never receive an assistant bubble. Architect already has the pattern: `POST /api/ai/design` → Trigger.dev run → `useRealtimeRun` → `sendAssistantMessage`. Chat needs the same loop without mutating the canvas.

Do not use `chat.agent` or a second Liveblocks channel. Collaborators already share `ai-chat`. Do not generate specs.

## Before implementing

- Read `context/project-overview.md`, `context/architecture-context.md`, and `context/ui-context.md`.
- Inspect `app/api/ai/design/route.ts`, `hooks/use-design-generation.ts`, `components/editor/ai-sidebar.tsx`, `trigger/generate-architecture.ts`, and `lib/ai-canvas-plan.ts`.
- Reuse `TaskRun`, `createRunPublicToken`, Gemini (`GOOGLE_AI_API_KEY` then fallbacks), and `serializeCanvasForPrompt`.
- Do not modify `components/ui/*`.

## Implementation

1. Add `explain-architecture` in `trigger/`.
   - Task id `explain-architecture`
   - Payload `{ projectId, prompt }` (`roomId` alias allowed). Optional `history`: up to 8 `{ role, content }` turns
   - Read the Liveblocks canvas the same way as design generation. Do not add, move, or delete nodes or edges
   - Ask Gemini (`gemini-3.6-flash`) to answer the question using the current graph
   - Return `{ summary }` as the user-facing reply. No JSON graph. No canvas operations
   - If the canvas is empty, say so. Do not invent a design
   - Do not publish `ai-status` or AI presence (those lock Architect as “updating the canvas”)

2. Add `POST /api/ai/chat`.
   - Same auth and membership checks as `POST /api/ai/design`
   - Body `{ prompt, projectId }` (`roomId` alias). Optional validated `history`
   - Trigger `explain-architecture` with a type-only import plus `tasks.trigger`
   - Persist a `TaskRun` and return `{ runId, publicToken }`
   - Do not wait for the job

3. Track the run from the Chat tab.
   - After a successful `ai-chat` user send, `POST /api/ai/chat`
   - Subscribe with `useRealtimeRun` (`enabled` only when both token values exist)
   - On terminal status, `sendAssistantMessage` with `summary` or a short failure note
   - Lock only the Chat composer while that run is active. Architect lock stays on design generation
   - Show a compact “Thinking…” strip above the Chat composer while the run is active
   - `Enter` submits, `Shift+Enter` inserts a newline

4. Keep Architect and Specs unchanged aside from sharing the assistant bubble on `ai-chat`.

## Scope Limits

- don't mutate the canvas
- don't add `chat.agent`, Feeds/Inbox, Comments, or a second chat channel
- don't wire Specs / `generate-spec`
- don't persist chat in Prisma or Blob
- don't modify `components/ui/*`

## Check When Done

- A Chat question produces a Ghost AI bubble about the current canvas.
- The canvas graph is unchanged by Chat.
- Architect generation still works and still locks only Architect.
- `npm run lint` and typecheck pass.
