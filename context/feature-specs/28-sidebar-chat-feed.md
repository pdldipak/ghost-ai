Add a room-scoped chat thread to the AI sidebar so every participant sees the same Architect messages in real time.

This unit is chat transport and sidebar rendering only. Do not wire `/api/ai/design`, Trigger.dev, canvas mutation, or spec generation.

`ai-status-feed` already exists. It is a named client subscription over `ai-status` RoomEvents (`AI_STATUS_FEED` in `types/tasks.ts`, `useAiStatusFeed` in `hooks/use-ai-status.ts`). It shows the latest generation status only. The Architect tab in `components/editor/ai-sidebar.tsx` is still a local `useState` demo thread: send appends a user bubble plus a hardcoded assistant placeholder. Collaborators do not share that thread.

## Before implementing

- Read `context/project-overview.md`, `context/architecture-context.md`, and `context/ui-context.md`.
- Load the Liveblocks skill references for room events and user information.
- Inspect the existing Liveblocks setup first: `liveblocks.config.ts`, `lib/ai-room.ts`, `hooks/use-ai-status.ts`, `components/editor/ai-status-feed.tsx`, `components/editor/ai-sidebar.tsx`, and `components/editor/canvas-room.tsx`.
- Follow the same feed pattern already used for status. `ai-status-feed` is not a Liveblocks Feeds/Inbox product. Do not add Feeds, Inbox, Comments, or a second realtime store unless the installed packages already use one.
- Keep chat on its own named channel. Do not mix chat payloads into `ai-status` events or `ai-status-feed`.

## Implementation

1. Add the `ai-chat` feed.

   Create a room-scoped chat channel named `ai-chat`, parallel to `AI_STATUS_FEED`.

   - Export a constant such as `AI_CHAT_FEED = "ai-chat"` from `types/tasks.ts`.
   - Extend `RoomEvent` in `liveblocks.config.ts` to a union of the existing `AiStatusEvent` and the new chat payload. Status events must keep working.
   - Subscribe and publish through Liveblocks room events (`useEventListener` / `useBroadcastEvent`), same as status.
   - Keep the channel room-scoped. The sidebar already sits inside `CanvasRoom` / `RoomProvider`.
   - Do not persist chat in Prisma, Vercel Blob, or a new API route.
   - Do not put chat messages in Presence or Storage.

2. Wire the chat feed into the Architect tab.

   Replace the local `messages` state in `AiArchitectTab`. The sidebar chat area must subscribe to `ai-chat` and render the shared thread.

   - Show messages in send order.
   - Each bubble must show sender, timestamp, and message content.
   - Keep the existing bubble layout: user messages right-aligned (`bg-accent-dim border-2 border-brand/50 text-copy`), other messages left-aligned (`bg-elevated border border-surface-border`).
   - Use Liveblocks `UserMeta.info.name` (and avatar if it already fits) for the sender label. Do not invent a user table.
   - Keep starter prompt chips: they fill the composer only; they do not send.
   - Keep the empty state when the feed has no valid messages.
   - Keep `ai-status-feed` in the sidebar header. Status stays latest-only; chat is the message list.
   - Use Tailwind token utilities and existing shadcn `Button`, `Textarea`, and `ScrollArea`. Do not modify `components/ui/*`.

3. Add message sending.

   Reuse the existing Architect composer (auto-resizing textarea and send button).

   - Any project member in the room may send to `ai-chat`.
   - Trim before send. Do not send empty messages.
   - `Enter` still submits; `Shift+Enter` still inserts a newline.
   - Clear the composer after a successful send.
   - Show a small inline error (`text-state-error`) if sending fails. Do not toast, overlay, or block the whole sidebar.
   - Keep the composer locked while generation is active (`useAiGenerationActive`). Do not remove that behavior.
   - Stop appending the hardcoded assistant placeholder. This unit is human room chat only.

4. Add message validation.

   Define the chat payload next to `AiStatusEvent` in `types/tasks.ts`. Validate unknown incoming events with a parse/guard, same style as `parseAiStatusEvent`. Ignore invalid payloads. Do not trust room events as typed data at the UI boundary.

   The payload should include:
   - `type: "ai-chat"` (so it cannot be confused with `ai-status`)
   - `sender` — display name string
   - `role` — `"user"` | `"assistant"` (human sends are `"user"` in this unit)
   - `content` — non-empty trimmed string
   - `timestamp` — numeric send time

   Include a stable `id` if the renderer needs a React key. Empty `content` is invalid.

## Scope Limits

- don't mix chat messages with `ai-status-feed` or `ai-status` events
- don't add Liveblocks Feeds/Inbox, Comments, Presence keys, or Storage keys
- don't wire the sidebar to `/api/ai/design` or Trigger.dev
- don't add Prisma models, Blob storage, or chat API routes
- don't restore the hardcoded assistant placeholder as a fake reply
- don't change canvas, presence avatars, live cursors, or the canvas status banner
- don't modify `components/ui/*`
- keep this focused on shared Architect chat only

## Check When Done

- Architect chat reads and writes a room-scoped `ai-chat` feed, separate from `ai-status-feed`.
- All participants in the room see the same ordered messages with sender, timestamp, and content.
- The existing composer sends, clears on success, and shows a small error on failure.
- Incoming chat payloads are validated in `types/tasks.ts` before render.
- Shared AI status, composer lock while generating, and Specs tab behavior are unchanged.
- `npm ci`, `npm run lint`, and `npm run build` pass.
