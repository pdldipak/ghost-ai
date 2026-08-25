# UI Context 

## Theme
Semantic color tokens drive the workspace UI. Dark is the default. Users can switch among Dark, Light, Midnight, Ocean, and Forest, or override only `--bg-base` with a custom page background. Themes are applied with `data-theme` on `<html>`; the `.dark` class stays on so shadcn `dark:` styles do not flip to the default light palette. Selection (and the optional custom background) persist in `localStorage`.

All colors are defined as CSS custom properties in `globals.css` and mapped to Tailwind tokens via `@theme inline`. Components must use the tokens — no hardcoded hex values or raw Tailwind color classes like `zinc-*`. Theme-specific values live only in `globals.css`; components stay on semantic classes such as `bg-base` and `text-copy`.

Default (Dark) palette:

| Role                   | CSS Variable           | Hex / Value |
| ---------------------- | ---------------------- | ----------- |
| Page background        | `--bg-base`            | `#080809`   |
| Surface                | `--bg-surface`         | `#111114`   |
| Elevated surface       | `--bg-elevated`        | `#18181c`   |
| Subtle surface         | `--border`             | `#2a2a2f`   |
| Default border         | `--border-default`     | `#2a2a30`   |
| Subtle border          | `--border-subtle`      | `#3a3a42`   |
| Primary text           | `--text-primary `      | `#f0f0f4`   |
| Secondary text         | `--text-secondary`     | `#c0c0cc`   |
| Muted text             | `--text-muted`         | `#808090`   |
| Faint text             | `--text-faint`         | `#505060`   |
| Brand accent           | `--accent-primary`     | `#00c8d4` (cyan)  |
| Brand dim              | `--accent-primary-dim` | `rgba(0, 200, 212, 0.12)`   |
| AI accent              | `--accent-ai`          | `#6457f9` (indigo purple)   |
| AI text                | `--accent-ai-text`     | `#8b82ff`   |
| Error                  | `--state-error`        | `#ff4d4f`   |
| Success                | `--state-success`      | `#34d399`   |
| Warning                | `--state-warning`      | `#fbbf24`   |

Tailwind utility names map to these variables. Use `bg-base`, `bg-surface`, `text-copy`, `primary`, 
`text-copy-muted`, `border-surface-border`, `text-brand`, `bg-accent-dim`, etc. 

## Typography 
| Role                   | Font                   | CSS Variable        |
| ---------------------- | ---------------------- | ------------------- |
| UI text                | `Geist Sans`           | `--font-geist-sans` |
| Code/mono              | `Geist-Mono`           | `--font-geist-mono` |

Both fonts are loaded via `next/font/google` and applied as CSS variable on the `<html>` element. The base `body` uses Geist Sans with `antialiased`. 

## Border Radius
Radius increases with surface depth - smaller for inner elements, larger for outer containers. 

| Context                       | Class                  | 
| ----------------------        | ---------------------- |
| Inline / small UI             | `rounded-xl`           |
| Cards / panels                | `rounded-2xl`          |
| Modal / overlay               | `rounded-3xl`          |

## Canvas
### Node Color Palette
8 defined color pairs. Each pair specifies a dark node fill and a vivid contrasting text color tuned for readability on the dark canvas. Defined in `types/canvas.ts` as `NODE_COLORS`. 

| Node fill              | Text Color             | Character           |
| ---------------------- | ---------------------- | ------------------- |
| `#1F1F1F`              | `#EDEDED`              | `Neutral dark (default)` |
| `#10233D`              | `#52A8FF`              | `Blue`              |
| `#2E1938`              | `#BF7AF0`              | `Purple`            |
| `#331B00`              | `#FF990A`              | `Orange`            |
| `#3C1618`              | `#FF6166`              | `Red`               |
| `#3A1726`              | `#F75F8F`              | `Pink`              |
| `#0F2E18`              | `#3DD68C`              | `Green`             |
| `#062822`              | `#0AC7B4`              | `Teal`              |

Default node color: `#1F1F1F` with `#EDEDED` text.

### Node Shapes
Six variants: rectangle, pill, and circle use CSS (`rounded-xl` / `rounded-full`); diamond, hexagon, and cylinder use SVG that scales with node size. Borders stay subtle at rest (`border-surface-border` / `--border-default`) and brighten to `--accent-primary` when selected.

Selected nodes show small corner and edge resize handles in `--accent-primary` on `--bg-base`, with a minimum size of 48×32. A floating color toolbar sits just above the selected node with one swatch per `NODE_COLORS` pair; the active swatch is ringed in its text color, and hover uses a tight glow from that same text color. Labels stay centered; an empty node shows a faint `Label` placeholder. Double-clicking the label area overlays a textarea in the same position so collaborators can edit without shifting layout.

Connection handles sit on the top, right, bottom, and left of every node as small white dots with a dark border. They stay hidden until the node is hovered, then fade in. Any handle can connect to any other handle.

Dropping a shape from the panel places the new node with its center on the cursor. The viewport does not auto-zoom when the first node is dropped.

## Edge Style
Custom `canvasEdge` renderer with smooth-step (right-angle) routing, a theme-aware `--canvas-edge` stroke, rounded caps, and a closed arrowhead. Dark themes keep the original light `#f8fafc` stroke; Light uses `#18181c`. A custom page background picks the contrasting stroke from the background luminance so connectors stay visible. Edges stay slightly dimmed at rest and brighten when hovered or selected. An invisible wider hit path makes them easier to click without thickening the visible stroke. Connecting two nodes immediately opens an inline label editor at the `getSmoothStepPath` midpoint so you can describe the flow (for example “Persistent order state”). Hovering or selecting an unlabeled edge shows a faint `Describe flow` placeholder; click the chip or double-click the stroke to edit. Enter, Escape, or blur saves; the input grows with the text.

## Canvas Controls
A pill-shaped control bar sits at the bottom-left of the canvas, above the shape panel. Zoom out, fit view, and zoom in animate the React Flow viewport. Undo and redo use Liveblocks history and dim when unavailable. Keyboard shortcuts (`+`/`=`, `-`, Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z, Cmd/Ctrl+Y) are ignored while typing in editable fields. There is no minimap.

The workspace navbar includes a Save control to the left of Templates. It shows idle (`Save`), saving, saved, and error states using `text-copy-muted`, `text-state-success`, and `text-state-error`.

An icon-only appearance control sits at the far right of the editor navbar (before the home `UserButton`). It opens a compact panel of theme previews and a custom page-background color picker. Canvas node fills and node text colors stay on `NODE_COLORS`. Connector strokes use `--canvas-edge` so they remain visible on light themes and custom page backgrounds.

A display-only collaborator avatar stack sits at the top-right of the canvas pane, with the Clerk UserButton in the same group. Other participants' cursors appear on the canvas as a colored pointer with a name badge. When presence `isThinking` is true, the badge shows a small spinner; avatars use an `text-ai-text` ring. The AI sidebar shows three tabs — AI Architect, Chat, and Specs. Architect owns design generation (`POST /api/ai/design`) plus the room-scoped `ai-chat` thread. Chat asks Ghost AI about the current canvas (`POST /api/ai/chat` → `explain-architecture`) and posts the reply on the same thread without mutating the graph. Specs generate Markdown from the canvas (`POST /api/ai/spec` → `generate-spec`) with `useRealtimeRun`, then download as Markdown or PDF via `GET /api/projects/[projectId]/specs/[specId]/download?format=`. Architect chat, Chat, and spec cards are restored per project when Save history is on. A sidebar toggle turns persistence off and reveals Clear for that project’s saved chat and specs. Canvas snapshots still use the existing Save/autosave path. Spec generation does not lock Architect or mutate the graph. The header shows the latest shared `ai-status` message (or “Writing specification…” while a spec run is active) and locks only the Architect composer while design generation is active. Architect submit tracks the run with `useRealtimeRun`; a compact status strip sits above the Architect composer while a run is active. Canvas updates still arrive through Liveblocks, not from the sidebar.

