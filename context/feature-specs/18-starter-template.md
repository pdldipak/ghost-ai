Add a small starter template library so users can start a canvas from a pre-built diagram instead of building from scratch.

## Implementation

1. Create `components/editor/starter-templates.ts`.

   Include:
   - a `CanvasTemplate` type
   - a `CANVAS_TEMPLATES` array
   - at least three templates, such as microservices, CI/CD pipeline, and event-driven system

   Each template should include:
   - `id`
   - `name`
   - `description`
   - nodes
   - edges

   Use the shared canvas types and existing node color palette. Add small helper functions if needed to keep the template data readable.

2. Create `components/editor/starter-templates-modal.tsx`.

   The modal should:
   - open as a dialog
   - show template cards in a scrollable grid
   - show the template name and description
   - include an import button for each template

3. Add a simple diagram preview to each template card.
   - fit the preview to a fixed-size viewport
   - calculate the preview bounds from the template node positions
   - draw edges as simple lines between node centers
   - draw nodes using their shape and color data
   - keep the preview lightweight, no React Flow instance needed

4. Open the modal from the workspace.
   - add a Templates button to the editor navbar, next to Share
   - compose the existing `EditorDialog` for the dialog shell
   - only show the button in an open project workspace

5. Import a template into the active Liveblocks room.
   - use the existing Liveblocks canvas change handlers
   - replace the current nodes and edges with the selected template
   - keep the same `canvasNode` / `canvasEdge` schema and `NODE_COLORS` palette
   - close the modal after import
   - fit the canvas view to the imported diagram

## Scope Limits

- don't add APIs, database models, or blob persistence
- don't import templates during project creation
- don't add template authoring or a larger template library
- don't change node or edge rendering
- don't change the shape panel or canvas control bar
- don't add AI generation

## Check When Done

- `components/editor/starter-templates.ts` exports `CanvasTemplate` and at least three templates.
- The modal opens from the workspace navbar and shows a scrollable card grid.
- Each card shows a lightweight diagram preview, name, description, and Import.
- Import replaces the Liveblocks room graph with the template nodes and edges.
- Make sure `npm ci`, `npm run lint` and `npm run build` passes