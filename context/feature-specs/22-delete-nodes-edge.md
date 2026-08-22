Fix remaining canvas interaction bugs. Read the Liveblocks React Flow skill before changing delete or graph mutations. Read Clerk setup notes before touching image hostnames.

This is a bugfix unit against the current canvas. Several items from the original list are already implemented — verify them, then skip. Do not reimplement working behavior.

Do not add AI generation, persistence changes, or navbar redesigns.

## Already in place — skip unless broken

1. Delete nodes and edges.
   - `FlowCanvas` already passes `onDelete` from `useLiveblocksFlow` into `<ReactFlow onDelete={onDelete} />`.
   - That is the Liveblocks-recommended path. React Flow’s default Delete / Backspace keys go through it and sync across clients.
   - Do **not** add a custom `keydown` listener for Delete / Backspace.
   - Do **not** replace this with a `useNodes()` / `useEdges()` filter-and-remove helper.
   - Only touch delete if selected nodes/edges still cannot be removed. If so, fix the existing `onDelete` wiring — do not invent a second deletion path.

2. Four-side connection handles.
   - Feature 16 already added this. `components/editor/node-handles.tsx` renders top, right, bottom, and left `Handle`s with `Position.Top` / `Right` / `Bottom` / `Left`, `isConnectableStart`, and `isConnectableEnd`.
   - `FlowCanvas` already uses `ConnectionMode.Loose`.
   - Do not change handle components, CSS, or connection mode.

3. Workspace navbar `UserButton`.
   - Feature 19 already did this. `EditorNavbar` hides `UserButton` when `isWorkspace` is true (`{isWorkspace ? null : <UserButton />}`).
   - Editor home still shows the navbar `UserButton`. The workspace canvas already shows Clerk `UserButton` in `PresenceAvatars`.
   - Do not move or duplicate `UserButton` again.

## Implementation

1. Center dropped nodes on the cursor.
   Current bug: dropping a shape from the shape panel places the node **below/right** of the cursor because `hooks/use-shape-drop.ts` uses `screenToFlowPosition({ x: event.clientX, y: event.clientY })` as React Flow `position` (top-left).

   Fix only the drop position in `use-shape-drop.ts` / `createDroppedCanvasNode`:
   - keep `screenToFlowPosition` for pan, zoom, and the canvas bounding rect — do not reimplement that math
   - offset by half of `payload.width` and `payload.height` so the **node center** lands on the cursor
   - do not change drag preview, mime type, or node create payload besides position

2. Stop auto-zoom when dropping the first node.
   Current bug: dropping the first node onto an empty canvas zooms in. Dropping onto a canvas that already has nodes does not.

   Likely cause: `<ReactFlow fitView />` in `components/editor/flow-canvas.tsx`. With an empty graph, xyflow can treat the first node as `nodesInitialized` and fit the viewport around that single node.

   Required behavior:
   - a shape-panel drop must **not** change zoom or pan
   - keep explicit `reactFlow.fitView(...)` for blob restore (`handleFitSavedView`), template import (`handleImportTemplate`), and the control-bar Fit control
   - if you remove the ReactFlow `fitView` boolean, do not lose a one-time fit for rooms that already have nodes on first paint — only add an init-time fit if needed, never as a side effect of drop
   - do not guard this inside the drop handler with a workaround that still lets `fitView` run

3. Allow Clerk avatar images.
   `next.config.ts` has no `images.remotePatterns`. Add `img.clerk.com` with `https` using Next’s `remotePatterns` config (this file is `next.config.ts`, not `next.config.js`).
   Presence avatars currently use CSS `background-image`, but Clerk `UserButton` still needs the hostname allowed. Do not change avatar rendering.

## Scope Limits

- don't reimplement delete, handles, or navbar `UserButton` if they already work
- don't add a custom Delete/Backspace listener
- don't change node/edge renderers, handle styles, or `ConnectionMode`
- don't change autosave, blob restore, template import, or the control bar beyond stopping drop-triggered fit/zoom
- don't change shape-panel drag preview or create payload besides drop position
- don't modify `components/ui/*`

## Check When Done

- Selected nodes and edges still delete with Delete/Backspace through Liveblocks `onDelete` (no second key handler).
- Dropping a shape places the node centered on the cursor at the current pan/zoom.
- Dropping the first node on an empty canvas does not auto-zoom; restore, template import, and the Fit button still fit the view.
- `img.clerk.com` is allowed in `next.config.ts` `images.remotePatterns`.
- Workspace navbar still has no `UserButton`; editor home navbar still does.
- `npm ci`, `npm run lint`, and `npm run build` pass.
