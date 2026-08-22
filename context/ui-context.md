# UI Context 

## Theme
Dark only. No light mode. The visual language is a dark technical workspace - near-black background, layered surfaces, and vivid accent colors for interactive elements. 

All colors are defined as CSS custom properties in `global.css` and mapped to Tailwind token via `@theme inline`. Components must use the token - no hardcoded hex values or raw Tailwind color classes like `zinc-*`

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

## Edge Style
Custom `canvasEdge` renderer with smooth-step (right-angle) routing, a light `#f8fafc` stroke, rounded caps, and a closed arrowhead. Edges stay slightly dimmed at rest and brighten when hovered or selected. An invisible wider hit path makes them easier to click without thickening the visible stroke. Double-clicking an edge opens an inline label editor at the `getSmoothStepPath` midpoint via `EdgeLabelRenderer`; the input grows with the text.

## Canvas Controls
A pill-shaped control bar sits at the bottom-left of the canvas, above the shape panel. Zoom out, fit view, and zoom in animate the React Flow viewport. Undo and redo use Liveblocks history and dim when unavailable. Keyboard shortcuts (`+`/`=`, `-`, Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z, Cmd/Ctrl+Y) are ignored while typing in editable fields. There is no minimap.

A display-only collaborator avatar stack sits at the top-right of the canvas pane, with the Clerk UserButton in the same group. Other participants' cursors appear on the canvas as a colored pointer with a name badge.

