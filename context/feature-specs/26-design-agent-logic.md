Implement the design agent so a user prompt produces real-time updates on the collaborative canvas, with visible AI presence and status.

This unit fills in the existing architecture task. No new task file, no API changes, and no AI sidebar wiring.

`trigger/generate-architecture.ts` already exists as a stub (`id: "generate-architecture"`, payload `{ projectId, prompt }`). `projectId` is the Liveblocks room ID. `POST /api/ai/design` already triggers this task and stores a `TaskRun`. The task currently logs/echoes input only — no Gemini, no Liveblocks, no canvas writes.

`@ai-sdk/google`, `ai`, `@liveblocks/node`, and `@liveblocks/react-flow` are already installed. `GEMINI_API_KEY` is already in `.env.local`. Reuse `lib/liveblocks.ts` for the Node client (`LIVEBLOCKS_SECRET_KEY`).

## Before implementing

- Read `context/project-overview.md` and `context/architecture-context.md` for product behavior and system rules.
- Load the `trigger-authoring-tasks` skill and the version-pinned SDK docs under `node_modules/@trigger.dev/sdk`. This is a `task()`, not `chat.agent`.
- Load the Liveblocks skill references for React Flow mutation and AI-as-a-collaborator / presence. Follow current Liveblocks + Trigger.dev patterns; do not invent a parallel agent runtime.
- Reuse the existing Liveblocks flow and presence. Do not add a new store, presence fields, or canvas mutation path.

## Implementation

Keep `trigger/generate-architecture.ts`. Do not create `trigger/design-agent.ts` or any other parallel design task.

- keep task id `generate-architecture`
- keep payload `{ projectId, prompt }`
- `projectId` is the Liveblocks room ID; do not add a separate `roomId` field

Then implement the run:

1. Interpret the user prompt with Gemini via `@ai-sdk/google`.
   - Turn the prompt into canvas operations against the **current** room graph (read existing nodes/edges first).
   - Do not wipe the canvas unless the prompt clearly asks to replace or generate a new design.

2. Apply those operations through the existing collaborative React Flow document that `useLiveblocksFlow` already syncs in `components/editor/flow-canvas.tsx`.
   - Mutate the Liveblocks room from the worker with `@liveblocks/node` (`lib/liveblocks.ts`).
   - Collaborators must see node/edge changes in real time. Do not write Blob, Prisma, or a local graph copy as the source of truth.

3. Support these actions on the shared graph:
   - add node
   - move node
   - resize node
   - update node data (label, color, shape)
   - delete node
   - add edge
   - delete edge

   Created/updated nodes must be type `canvasNode` with `id`, `position`, `width`, `height`, and `data: { label, color, shape }` from `types/canvas.ts`.
   Created/updated edges must be type `canvasEdge` with `id`, `source`, `target`, `sourceHandle` / `targetHandle` from `NODE_HANDLE_IDS`, and `data.label`. Reuse `lib/canvas-edges.ts` (`CANVAS_EDGE_STYLE`, `CANVAS_EDGE_MARKER`) so AI edges match user-drawn edges.

4. Publish AI activity so every participant in the room sees progress.
   - Use Liveblocks, not a new feed, database table, or React state.
   - Push clear status at start, processing, complete, and on failure.
   - If a typed channel is needed, extend `RoomEvent` in `liveblocks.config.ts`. Do not add Storage keys that bypass `useLiveblocksFlow`.

5. Update AI presence while the task runs, using the existing fields only:
   - `cursor: { x, y } | null`
   - `isThinking: boolean`
   - Set `isThinking: true` and move `cursor` over the nodes being changed so the existing live-cursor UI shows the AI working.
   - Do not rename these fields or add new presence keys.

6. Generated designs must follow the current canvas rules:
   - shapes: only `NODE_SHAPES` (`rectangle`, `diamond`, `circle`, `pill`, `cylinder`, `hexagon`)
   - colors: only `NODE_COLORS` fills (`DEFAULT_NODE_COLOR` when unspecified)
   - size: `SHAPE_DEFAULT_SIZES` for new nodes; never below `NODE_MIN_WIDTH` / `NODE_MIN_HEIGHT` (48×32)
   - layout: keep spacing readable; place new nodes without stacking on existing ones; use four-side handles (`top` / `right` / `bottom` / `left`) for connections

7. Handle errors without leaving the room stuck.
   - Catch Gemini and Liveblocks failures.
   - Publish a failure status.
   - Do not apply a partial/invalid graph.

8. When the task finishes (success or failure), clear AI presence (`cursor: null`, `isThinking: false`) and leave the room.

## Scope Limits

- don't change canvas architecture or `useLiveblocksFlow`
- don't introduce a new state system outside Liveblocks
- don't bypass the existing collaborative flow document
- don't create `trigger/design-agent.ts` or a second design task
- don't add `chat.agent`
- don't change `POST /api/ai/design` or `POST /api/ai/design/token`
- don't wire the AI sidebar, Prisma, or Vercel Blob from this task

## Check When Done

- `generate-architecture` interprets the prompt with Gemini and updates the Liveblocks canvas through the existing React Flow document.
- Supported actions can add/move/resize/update/delete nodes and add/delete edges using `canvasNode` / `canvasEdge`.
- AI presence (`cursor` + `isThinking`) and status (start, processing, complete, failure) are visible to all participants in the room.
- Presence is cleared when the task finishes.
- `npm ci`, `npm run lint`, and `npm run build` pass.
