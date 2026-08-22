Add autosave and restore for the collaborative canvas so project state is persisted before AI generation. Canvas JSON lives in Vercel Blob. Prisma stores only the blob URL on the existing `canvasJsonPath` field.

There is no persistence today. `FlowCanvas` keeps nodes and edges in the Liveblocks room only. `canvasJsonPath` is a placeholder path (`canvas/{projectId}.json`), not a blob URL. There is no Save control in the workspace navbar.

Do not add AI generation.

## What to Install

- `@vercel/blob`

`BLOB_READ_WRITE_TOKEN` is already in `.env`. Use it. Do not invent a second token name. After install, add it to the README environment table and change the “Planned (not installed)” Vercel Blob note so Blob is listed as installed.

## Implementation

1. Reuse the existing Prisma field. Do not add a migration.
   - review `prisma/models/project.prisma`
   - reuse `Project.canvasJsonPath` for the blob URL
   - keep Prisma responsible for metadata only
   - do not add a second canvas URL field
   - treat the current create-time value `canvas/{projectId}.json` (and `"pending"`) as “no snapshot yet”
   - a saved snapshot is only a real `http(s)` blob URL written after a successful upload

2. Add a small Blob helper in `lib/`.
   - create `lib/canvas-blob.ts`
   - pathname: `canvas/{projectId}.json` (matches architecture-context)
   - `put` with `access: "public"`, `addRandomSuffix: false`, `allowOverwrite: true`, `contentType: "application/json"`
   - upload `{ nodes, edges }` JSON
   - return the blob `url`
   - fetch JSON from a stored blob URL for the GET route
   - keep route handlers thin: auth, validation, Prisma, then this helper

3. Add canvas save/load API routes at `app/api/projects/[projectId]/canvas/route.ts`.

   Follow existing route patterns: `params` is `Promise<{ projectId: string }>`, Clerk auth, JSON body validation, `NextResponse.json`.

   Access:
   - unauthenticated → `401`
   - missing/unauthorized project → `404` (same as collaborators GET)
   - owner **or** collaborator may GET and PUT (`getClerkIdentity` + `getAccessibleProject`)

   `PUT /api/projects/[projectId]/canvas`
   - body: `{ nodes, edges }`
   - validate both are arrays
   - each node must be type `canvasNode` with `id`, `position`, and `data` (`label`, `color`, `shape`)
   - each edge must be type `canvasEdge` with `id`, `source`, `target`, and `data.label`
   - persist extra React Flow fields needed to restore the graph (width, height, sourceHandle, targetHandle, style/marker if present)
   - upload JSON to Vercel Blob
   - store the returned blob URL on `canvasJsonPath`
   - return `{ canvasJsonPath }` (and `nodes`/`edges` if useful)

   `GET /api/projects/[projectId]/canvas`
   - read `canvasJsonPath` from Prisma
   - if it is not an `http(s)` URL, return `{ nodes: [], edges: [], hasSnapshot: false }` without calling Blob
   - otherwise fetch the JSON from the blob URL and return `{ nodes, edges, hasSnapshot: true }`
   - do not write Liveblocks state on the server

4. Add `hooks/use-canvas-autosave.ts`.
   Hooks live in `hooks/`, not `/hook`.

   The hook should:
   - take `projectId`, current Liveblocks `nodes` / `edges`, and the `onNodesChange` / `onEdgesChange` handlers
   - on first hydrate, if the Liveblocks room already has any nodes or edges, skip blob load entirely
   - if the room is empty, GET the canvas once; if `hasSnapshot` is true and the payload has nodes or edges, load them into the room the same way template import does (remove then add via the Liveblocks change handlers), then `fitView`
   - never load again for that mount, even if the user later clears the canvas
   - do not autosave until that initial load attempt has finished
   - debounce PUT saves at **1500ms** while nodes/edges change
   - skip PUT when the graph is unchanged from the last successful save
   - expose `status`: `"idle" | "saving" | "saved" | "error"`
   - expose `saveNow()` for a manual flush (cancel the debounce timer and PUT immediately)
   - clicking Save should not wait for the debounce

5. Wire the hook in `FlowCanvas`.
   - `FlowCanvas` / `FlowCanvasInner` currently have no `projectId`; pass it from `EditorShell` (`activeProjectId` is the room ID)
   - keep `useLiveblocksFlow` as the source of nodes and edges
   - do not change shape drop, edges, templates, presence, or the control bar beyond calling the hook

6. Add a Save status control to the workspace navbar.
   There is no Save button today. Add one on the workspace view only, to the left of Templates, using the existing ghost `Button` size `sm` pattern.

   Labels:
   - idle → `Save`
   - saving → `Saving…`
   - saved → `Saved`
   - error → `Save failed`

   Tokens (check `app/globals.css` `@theme inline` before adding a class):
   - idle/saving → `text-copy-muted`
   - saved → `text-state-success`
   - error → `text-state-error`

   Clicking the control calls `saveNow()`. Disable it while `saving`. Do not show this control on editor home.

## Storage Pattern

- Prisma stores project metadata and the canvas blob URL in `canvasJsonPath`.
- Vercel Blob stores the canvas JSON at `canvas/{projectId}.json`.
- Liveblocks remains the live collaborative graph. Blob is the durable snapshot for empty rooms and reload after the room is gone.

## Scope Limits

- don't add a Prisma migration or new schema fields
- don't store canvas JSON in PostgreSQL
- don't change Liveblocks auth, presence, or room tokens
- don't change node/edge rendering, shape panel, control bar, templates, share, or the AI sidebar
- don't add AI generation, spec generation, or Trigger.dev
- don't upload from the browser directly to Blob; go through the API route
- don't overwrite a non-empty Liveblocks room from blob
- don't modify `components/ui/*`

## Check When Done

- `@vercel/blob` is installed and `BLOB_READ_WRITE_TOKEN` is documented in README.
- `PUT`/`GET` `/api/projects/[projectId]/canvas` exist, are membership-gated, and persist via Blob + `canvasJsonPath`.
- Empty Liveblocks rooms restore from a saved blob once; rooms that already have nodes/edges are left alone.
- Canvas edits debounce-save; the navbar Save control shows idle/saving/saved/error and can flush immediately.
- `npm ci`, `npm run lint`, and `npm run build` pass.
