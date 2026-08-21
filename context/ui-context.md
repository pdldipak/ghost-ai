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

Selected nodes show small corner and edge resize handles in `--accent-primary` on `--bg-base`, with a minimum size of 48×32. Labels stay centered; an empty node shows a faint `Label` placeholder. Double-clicking the label area overlays a textarea in the same position so collaborators can edit without shifting layout. 

## Edge Style
Smooth-step path with an arrow marker. Default edge color: `#f8fafc`. Stroke width is thin - edges are visually secondary to nodes. 

