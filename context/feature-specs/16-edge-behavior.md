Replace the default canvas edges with custom edges that feel easier to follow, easier to click, and support inline labels.

## Implementation

1. Add connection handles to every node.
   - place handles on the top, right, bottom, and left sides
   - users should be able to connect from any handle to any other handle
   - keep the handles subtle: small white dots with a dark border
   - hide them by default and fade them in when hovering the node

2. Add a default style for new edges.
   - use a light stroke with rounded ends
   - add an arrowhead at the end of each edge
   - make new connections use the custom canvas edge renderer

3. Create the custom edge renderer.
   - use clean right-angle routing
   - keep edges slightly dimmed at rest
   - brighten edges when hovered or selected
   - make edges easier to hover and click without increasing the visible line thickness

4. Add inline edge label editing.
   - double-click an edge to edit its label
   - use React Flow's `EdgeLabelRenderer` and the path midpoint coordinates from `getSmoothStepPath` to position the label – do not calculate midpoint position manually
   - use an input that grows with the label text

## Scope Limits

- don't change node shapes, resize, label editing, or the color toolbar
- don't change the shape panel or drag/drop create behavior
- don't add edge types, colors, or a full edge style picker
- don't persist edges to the server; keep updates in the existing collaborative canvas state
- keep this focused on handles, custom edge rendering, and inline edge labels only

## Check When Done

- Nodes expose top, right, bottom, and left handles that stay hidden until the node is hovered.
- Users can connect from any handle to any other handle.
- New edges use the custom `canvasEdge` renderer: right-angle routing, light rounded stroke, arrowhead, dim at rest, brighter when hovered or selected.
- Edges are easier to hover and click without looking thicker.
- Double-clicking an edge opens an inline label editor at the `getSmoothStepPath` midpoint via `EdgeLabelRenderer`, and the input grows with the text.
- Make sure `npm ci`, `npm run lint` and `npm run build` passes
