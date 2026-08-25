Add shared AI activity indicators so every participant in the room can see when generation is in progress.

This unit is UI, presence, and realtime status only. Do not add the AI generation flow, Trigger.dev calls from the sidebar, or canvas mutation from the client.

`generate-architecture` already publishes Liveblocks presence (`cursor`, `isThinking`) and `RoomEvent` `{ type: "ai-status", step, message }` through `lib/ai-room.ts`. The canvas already has `AiStatusFeed` + `useAiStatus`. Live cursors append `· thinking` text. Presence avatars already ring when `isThinking` is true. The AI sidebar in `components/editor/ai-sidebar.tsx` is still local demo chat: it does not show shared status, does not disable the composer, and does not read presence.

## Before implementing

- Read `context/project-overview.md`, `context/architecture-context.md`, and `context/ui-context.md`.
- Load the Liveblocks skill references for presence, room events, and AI-as-a-collaborator.
- Inspect the existing Liveblocks setup first: `liveblocks.config.ts`, `lib/ai-room.ts`, `hooks/use-ai-status.ts`, `components/editor/ai-status-feed.tsx`, `components/editor/live-cursors.tsx`, `components/editor/presence-avatars.tsx`, and `components/editor/ai-sidebar.tsx`.
- Reuse the installed presence fields and `ai-status` room events. Do not add a parallel realtime store, a second presence key, or a Liveblocks Feeds/Inbox channel unless the current packages already use one.

## Implementation

1. Add AI thinking state to the sidebar.

   Wire `components/editor/ai-sidebar.tsx` to the shared room, not local React state.

   - Show a small status indicator in the sidebar when AI is working (`text-ai-text`, existing Bot icon or a compact spinner).
   - The indicator must be visible to every participant in the room, not only the user who sent the prompt.
   - Disable the Architect chat textarea and send action while generation is active.
   - Show a loading state on the send button while generation is active.
   - Keep the rest of the sidebar usable: tabs, Specs, message history, and close remain interactive. Do not dim or block the whole panel.

   Treat generation as active when the latest validated status is `start` or `processing`, or when any presence in the room has `isThinking: true`. Re-enable the composer on `complete`, `failure`, or when thinking presence clears.

2. Surface a shared AI status feed in the sidebar.

   Reuse the existing `ai-status` room-event channel. Keep the current canvas banner if it still makes sense, but the sidebar must subscribe independently so collaborators see status even if they are looking at the chat.

   - Create or reuse a client subscription named `ai-status-feed` (the existing `AiStatusFeed` / `useAiStatus` path is the starting point).
   - Subscribe to the latest feed message in the sidebar.
   - Show only the most recent status message. Do not render full feed history.
   - Keep the payload generic enough for design generation now and spec generation later (`start` / `processing` / `complete` / `failure`, plus optional display text).
   - Do not invent a second broadcast path. The worker already calls `publishAiStatus`; the client only listens.

3. Add status message validation.

   Define the feed payload schema in `types/tasks.ts`. Move or re-export the existing `AiStatusEvent` / `AiStatusStep` types from `lib/ai-room.ts` so worker and UI share one contract.

   The payload should include:
   - `type: "ai-status"`
   - `step: "start" | "processing" | "complete" | "failure"`
   - optional `text` (display copy; fall back to `message` from the current worker event if that field is still in use)

   Validate unknown incoming events with a type guard before displaying them. Ignore invalid payloads. Do not trust room events as typed data at the UI boundary.

4. Add thinking indicators to live cursors.

   Presence already has `isThinking: boolean`. Do not rename it to `thinking`. Do not add new presence keys.

   In `components/editor/live-cursors.tsx`:
   - when a participant has `isThinking: true`, show a small spinner in their cursor name badge
   - hide the spinner when `isThinking` is false or missing
   - keep the existing pointer and name badge; this is an addition, not a cursor redesign

   Leave the presence-avatar thinking ring as it is unless a small consistency tweak is required.

## Scope Limits

- don't add actual AI generation logic or sidebar → `/api/ai/design` wiring
- don't trigger background tasks from this unit
- don't block, overlay, or dim the whole sidebar
- don't show full feed history
- don't add Storage keys, Liveblocks Feeds/Inbox, or a new presence field
- don't rename `isThinking` or change `generate-architecture` beyond sharing the payload type
- don't modify `components/ui/*`
- keep this focused on shared AI activity state only

## Check When Done

- Sidebar renders shared AI status from the `ai-status` / `ai-status-feed` subscription.
- Chat input and send button respond to active generation state; the rest of the sidebar stays usable.
- Cursor badges read `isThinking` from presence and show a spinner while thinking.
- Incoming feed messages are validated through the schema in `types/tasks.ts`.
- `npm ci`, `npm run lint`, and `npm run build` pass.
