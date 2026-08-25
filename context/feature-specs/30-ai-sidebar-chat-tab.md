Add a Chat tab to the AI Workspace sidebar so the tab bar matches the product chrome: AI Architect, Chat, Specs.

The Architect tab already owns design generation (`POST /api/ai/design`) and the room-scoped `ai-chat` thread. Collaborators looking for a Chat tab cannot find it. Specs stays a visual placeholder.

This unit is sidebar tabs and Chat-tab sending only. Do not add a new feed, API, Prisma model, Blob store, or spec-generation wiring.

## Before implementing

- Read `context/project-overview.md`, `context/architecture-context.md`, and `context/ui-context.md`.
- Inspect `components/editor/ai-sidebar.tsx`, `hooks/use-ai-chat.ts`, and `types/tasks.ts`.
- Reuse the existing `ai-chat` RoomEvent channel. Do not add Liveblocks Feeds, Inbox, Comments, Presence keys, or Storage keys.
- Do not modify `components/ui/*`.

## Implementation

1. Add a Chat tab between AI Architect and Specs.
   - Tab order: `AI Architect`, `Chat`, `Specs`
   - Default tab remains `AI Architect`
   - Keep the existing tab styles: active `bg-accent-dim text-brand`, inactive `text-copy-muted`
   - Make the tab list span the sidebar width so the three labels sit in equal segments
   - Use `text-xs` on the triggers so `AI Architect` still fits in `w-80`

2. Keep AI Architect as the design-generation surface.
   - Starter chips, composer, send → `ai-chat` plus `/api/ai/design`
   - Composer still locks while generation is active
   - Message list and status strip stay on this tab

3. Build the Chat tab against the same `ai-chat` feed.
   - Render the shared thread with the existing bubble layout (sender, timestamp, own messages right-aligned)
   - Empty state: short copy that this tab is for discussing the design, not generating a canvas
   - Composer placeholder: `Ask about the architecture`
   - Send writes a `role: "user"` `ai-chat` event only. Do not call `/api/ai/design`
   - Trim before send. Do not send empty messages. `Enter` submits, `Shift+Enter` inserts a newline
   - Clear the composer after a successful send
   - Show the same small inline send error as Architect
   - Do not lock the Chat composer while generation is active (Architect lock is unchanged)
   - Do not add a hardcoded assistant reply

## Scope Limits

- don't add a second chat channel, API route, Prisma model, or Blob persistence
- don't wire Specs / `generate-spec`
- don't change canvas, presence, or design-generation behavior
- don't modify `components/ui/*`

## Check When Done

- The AI sidebar shows three tabs in order: AI Architect, Chat, Specs.
- Chat shows the same ordered `ai-chat` thread as Architect.
- Chat send does not start design generation.
- Architect send, composer lock, and Specs placeholder are unchanged.
- `npm run lint` and typecheck pass.
