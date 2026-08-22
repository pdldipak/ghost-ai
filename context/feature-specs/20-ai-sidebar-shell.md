Complete the existing AI sidebar placeholder and turn it into a proper floating chat sidebar. This unit is UI-only.

The current placeholder lives inline in `components/editor/editor-shell.tsx` as `AiSidebarPlaceholder`. It is not a floating overlay and it unmounts when closed. The left `ProjectSidebar` is the placement/animation reference: fixed overlay, does not push layout, stays mounted, and slides with `transition-transform`.

Parent-owned open/close state already exists. Keep it:

- `isAiSidebarOpen` / `setIsAiSidebarOpen` in `EditorShell`
- navbar AI toggle via `isAiSidebarOpen` and `onAiSidebarToggle`

Do not add backend, Liveblocks, or AI generation logic.

## Implementation

1. Extract the AI sidebar into its own component.
   - create `components/editor/ai-sidebar.tsx`
   - replace `AiSidebarPlaceholder` in `EditorShell`
   - keep open/close controlled by the parent (`isOpen`, `onClose`)
   - show the sidebar only on the workspace/canvas view, same as today
   - do not change the navbar AI toggle

2. Make it a floating right overlay that slides in, matching `ProjectSidebar`.
   - `fixed top-12 right-0 z-40`
   - `h-[calc(100vh-3rem)] w-80`
   - `border-l border-surface-border bg-surface/95 shadow-lg`
   - `transition-transform duration-200 ease-in-out`
   - open: `translate-x-0`
   - closed: `translate-x-full`
   - keep the component mounted while closed so the slide animation works
   - set `aria-hidden={!isOpen}`
   - do not push or shrink the canvas layout

3. Add the sidebar header.
   - title: `AI Workspace` using `text-copy`
   - subtitle: `Collaborate with Ghost AI` using `text-copy-muted`
   - small bot icon
   - close button on the right that calls `onClose`
   - match the `ProjectSidebar` header close-button pattern

4. Add a tabbed layout with shadcn `Tabs`.
   - tabs: `AI Architect` and `Specs`
   - default tab: `AI Architect`
   - follow the `ProjectSidebar` tabs structure (`TabsList` + `TabsContent`, content fills remaining height)
   - active tab: `bg-accent-dim text-brand`
   - inactive tab: `text-copy-muted`

5. Build the AI Architect tab.

   Use existing shadcn `Button`, `Textarea`, and `ScrollArea`.
   Local UI state only. No API calls.

   Chat area:
   - scrollable message list
   - empty state: bot icon, short description, and starter prompt chips
   - starter chips:
     - `Design an e-commerce backend`
     - `Create a chat app architecture`
     - `Build a CI/CD pipeline`
   - style chips as soft pills: `bg-elevated text-ai-text`
   - clicking a chip fills the input; it does not send a message

   Messages:
   - user messages: right-aligned, `bg-accent-dim border-2 border-brand/50 text-copy`
   - assistant messages: left-aligned, `bg-elevated border border-surface-border text-ai-text`
   - seed a couple of local demo messages after the first send so the thread is visible
   - assistant replies can be a short hardcoded placeholder string

   Input:
   - auto-resizing textarea, min height ~72px, max height ~160px
   - send button: `bg-brand text-primary-foreground`
   - `Enter` submits, `Shift+Enter` inserts a newline
   - do not send empty messages

6. Build the Specs tab.
   - `Generate Spec` button using `bg-brand text-primary-foreground`
   - the button is visual only; no generation
   - one demo spec card: `bg-elevated border border-surface-border rounded-2xl`
   - card includes a file/spec icon, title, short snippet, and a disabled download action

7. Use existing project color tokens only.

   Check `app/globals.css`, `context/ui-context.md`, and the Tailwind `@theme inline` mapping before adding a class.
   Do not invent tokens. Do not use raw hex or `zinc-*` / `slate-*` classes.

   Use these mappings:
   - title text → `text-copy`
   - muted/subtitle text → `text-copy-muted`
   - surfaces → `bg-surface`, `bg-elevated`
   - borders → `border-surface-border`
   - brand/accent actions → `bg-brand`, `bg-accent-dim`, `text-brand`
   - AI-tinted text → `text-ai-text`

## Scope Limits

- don't change navbar AI toggle wiring
- don't rebuild `ProjectSidebar`
- don't change canvas, presence, templates, or share dialogs
- don't add backend routes, Prisma models, blob storage, or Trigger.dev tasks
- don't add Liveblocks chat, comments, or AI generation
- don't modify `components/ui/*`

## Check When Done

- Workspace AI toggle still opens and closes the sidebar from the parent.
- Sidebar floats over the canvas from the right and slides in/out without pushing layout.
- Header, tabs, Architect empty/chat states, and Specs demo card all render with project tokens.
- No AI, spec, or Liveblocks logic was added.
- `npm ci`, `npm run lint`, and `npm run build` pass.
