# Project Actions

Chronological history of completed work on **Ghost Assistant**.

## For AI agents

After finishing a task, **append one row** to the table below (do not edit or remove past rows).

| Field | Rule |
|-------|------|
| **When** | End of the session step, before marking work complete |
| **Date** | `YYYY-MM-DD` (day the work was done) |
| **Action** | One sentence, past tense — what changed and why it matters |
| **Scope** | One row per completed unit (feature, fix, infra change, meaningful doc update) |
| **Skip** | Exploratory questions, failed attempts, trivial typo-only edits |

**Examples of good rows:**
- `Added Docker dev service (app-dev profile) with hot reload via docker-compose`
- `Documented Docker production and dev commands in README.md`

**Not the same as** `progress-tracker.md` — that file tracks *current* phase and next steps; this file is a permanent audit log.

| Date | Action |
|------|--------|
| 2026-06-16 | Scaffolded with `create-next-app` (TypeScript, Tailwind, App Router, ESLint) |
| 2026-06-17 | Stripped boilerplate: minimal `page.tsx`, Tailwind-only `globals.css`, removed `public/*.svg` (kept `app/favicon.ico`) |
| 2026-06-17 | Added Docker (`Dockerfile`, `docker-compose.yml`) and GitHub Actions CI/CD (lint, build, push image to GHCR on `main`) |
| 2026-06-17 | Fixed Docker build: keep `public/` in git (`.gitkeep`) so image COPY step succeeds |
| 2026-06-25 | Added `app-dev` service to `docker-compose.yml` (dev profile, volume mount, `next dev` hot reload) |
| 2026-06-25 | Documented Docker production and dev run commands in `README.md` |
| 2026-07-03 | Restructured root `AGENTS.md`: merged duplicate sections, added PROJECT-ACTIONS to reading order, clarified post-task doc updates |
| 2026-07-08 | Installed and configured shadcn/ui (base-nova): dark theme tokens in `globals.css`, `lib/utils.ts` with `cn()`, lucide-react, and Button/Card/Dialog/Input/Tabs/Textarea/ScrollArea primitives |
| 2026-07-08 | Added editor base chrome: `EditorNavbar`, floating `ProjectSidebar`, and reusable `EditorDialog` pattern under `components/editor/` |
| 2026-07-10 | Set up Clerk authentication via CLI: `@clerk/nextjs`, `proxy.ts` route protection, sign-in/sign-up routes, shadcn-themed `ClerkProvider`, and `AuthControls` in home header and editor navbar |
| 2026-07-10 | Fixed Docker/CI Node 22 requirement and regenerated `package-lock.json` with npm 10 so `npm ci` works in containers after Clerk deps were added |
| 2026-07-10 | Refined Clerk auth per `03-auth.md`: dark theme with CSS-variable overrides, two-panel auth layout, env-driven public routes, `/` auth redirects, `/editor` shell route, and `UserButton` in editor navbar |
| 2026-07-10 | Wired Geist Sans and Geist Mono into Clerk appearance and app shell so auth UI matches project typography guidelines |
| 2026-07-10 | Redesigned auth page layout to match reference (branding panel, feature icons, Clerk card styling) and renamed product branding to Ghost Assistant (`ghost-assistant` package slug) across auth UI, metadata, and docs |
| 2026-07-11 | Added editor home, create/rename/delete project dialogs, `useProjectDialogs` hook, mock project data, sidebar actions for owned projects, and mobile sidebar backdrop per `04-project-dialogs.md` |
| 2026-07-11 | Fixed hydration console warning by adding `suppressHydrationWarning` on `<body>` — caused by browser extension injecting `cz-shortcut-listen` before React hydrate |
| 2026-07-14 | Documented Prisma initial setup, day-to-day CLI commands, and Docker equivalents in `README.md` |
| 2026-07-14 | Added `npx skills add prisma/skills` to Prisma setup docs in `README.md` |
| 2026-07-14 | Added Prisma `Project` and `ProjectCollaborator` models, `lib/prisma.ts` singleton, and initial migration per `05-prisma.md` |
| 2026-07-17 | Added authenticated project REST APIs (list/create/rename/delete) with owner checks and 401/403 handling per `06-project-apis.md` |
| 2026-07-17 | Wired editor home sidebar and dialogs to real project APIs with server-fetched lists, `useProjectActions`, and workspace navigation per `07-wire-editor-home.md` |
| 2026-07-17 | Fixed pg SSL deprecation warning by setting `sslmode=verify-full` in env and normalizing prefer/require/verify-ca in `lib/prisma.ts` |
| 2026-07-17 | Lazy-initialized Prisma client so `next build` no longer requires `DATABASE_URL` during page data collection in CI |
| 2026-07-21 | Added editor workspace shell with server-side project access checks, AccessDenied UI, and canvas/AI sidebar placeholders per `08-editor-workspace-shell.md` |
| 2026-07-21 | Added share dialog with collaborator invite/remove APIs, Clerk name/avatar enrichment, and owner vs read-only collaborator UI per `09-share-dialog.md` |
| 2026-07-21 | Fixed CI lint failure by loading share-dialog collaborators on open instead of setState-in-effect |
| 2026-07-23 | Documented required stack, env vars, agent skills (Prisma + Liveblocks), and planned Trigger.dev/Blob in README.md |
| 2026-07-23 | Regenerated package-lock.json with Node 22/npm 10 so CI `npm ci` resolves utf-8-validate@5.0.10; fixed Liveblocks empty-object lint types |
| 2026-07-28 | Added Liveblocks realtime infra: typed config, cached node client with cursor-color helper, and project-gated `/api/liveblocks-auth` per `10-liveblocks-setup.md` |
| 2026-07-28 | Regenerated package-lock.json with Node 22/npm 10 so CI `npm ci` resolves nested utf-8-validate@5.0.10 again |
| 2026-08-12 | Replaced workspace canvas placeholder with Liveblocks-backed React Flow (`CanvasRoom` + `FlowCanvas`), added `types/canvas.ts`, and installed `react-error-boundary` per `11-base-canvas.md` |
| 2026-08-12 | Regenerated package-lock.json with Node 22/npm 10 so CI `npm ci` resolves nested utf-8-validate@5.0.10 after canvas deps |
| 2026-08-12 | Aligned all `@liveblocks/*` packages to 3.23.1 to fix duplicate `@liveblocks/core` crash on `/api/liveblocks-auth` |
| 2026-08-12 | Hardened `/api/liveblocks-auth` to return JSON when `LIVEBLOCKS_SECRET_KEY` is missing or Liveblocks calls fail |
| 2026-08-21 | Added a bottom shape panel so users can drag shapes onto the Liveblocks canvas, with a basic `canvasNode` renderer, per `12-shape-panel.md` |
| 2026-08-21 | Replaced the placeholder node renderer with CSS/SVG shape variants and a cursor-following shape drag preview per `13-node-shape.md` |
| 2026-08-21 | Added selected-node resize handles and overlay inline label editing on the Liveblocks canvas per `14-node-editing.md` |
| 2026-08-21 | Added a floating color toolbar on selected canvas nodes so collaborators can apply predefined fill/text pairs per `15-nodes-color-toolbar.md` |
| 2026-08-21 | Restored progress-tracker Session Notes to the stack/version inventory (Next.js, shadcn, Clerk, Liveblocks, Prisma) |
| 2026-08-21 | Added four-side hover handles, a custom smooth-step `canvasEdge` renderer, and inline edge label editing per `16-edge-behavior.md` |
| 2026-08-22 | Added a bottom-left canvas control bar for zoom and Liveblocks undo/redo, wired keyboard shortcuts, and removed the MiniMap per `17-canvas-ergonomics.md` |
| 2026-08-22 | Added a starter template library with navbar import into the active Liveblocks canvas per `18-starter-template.md` |
| 2026-08-22 | Added canvas presence avatars and live cursors, keeping the Clerk UserButton on editor home and in the workspace canvas group per `19-presence-avatars-cursor.md` |
| 2026-08-22 | Tightened `20-ai-sidebar-shell.md` into an implementation prompt against the current `AiSidebarPlaceholder` and real project tokens |
| 2026-08-22 | Replaced the workspace AI sidebar placeholder with a floating `AiSidebar` (header, Architect/Specs tabs, local demo chat) per `20-ai-sidebar-shell.md` |
| 2026-08-22 | Tightened `21-canvas-autosave.md` into an implementation prompt against the existing `canvasJsonPath` field, Liveblocks canvas, and workspace navbar |
| 2026-08-22 | Added canvas autosave and restore via Vercel Blob, `canvasJsonPath` URL storage, and a workspace navbar Save status per `21-canvas-autosave.md` |
| 2026-08-22 | Fixed canvas save failures on private Blob stores and made the navbar Save control force-upload and show saving/saved/error |
| 2026-08-22 | Centered shape-panel drops on the cursor, stopped first-drop auto-zoom by removing React Flow `fitView`, and allowed `img.clerk.com` in `next.config.ts` per `22-delete-nodes-edge.md` |
| 2026-08-22 | Added user-selectable background themes (CSS variable palettes, localStorage persistence, navbar appearance panel, custom page background) per `23-user-selectable-bg.md` |
| 2026-08-22 | Regenerated package-lock.json with Node 22/npm 10 so CI `npm ci` resolves nested utf-8-validate@5.0.10 |
| 2026-08-22 | Pinned the project to Node 22 / npm 10 (`.nvmrc`, engines, CI) to match Docker and the Clerk-era runtime |
| 2026-08-22 | Made canvas connector strokes follow `--canvas-edge` so they stay visible on light themes and custom page backgrounds |
| 2026-08-24 | Finished Trigger.dev setup: Node 22 worker, `trigger/` tasks, `hello-world` smoke test, pinned CLI, and `trigger:dev` / `trigger:deploy` scripts per `24-trigger-setup.md` |
| 2026-08-24 | Removed the Trigger.dev `hello-world` smoke-test task so `trigger/` only holds Ghost Assistant product jobs |
| 2026-08-24 | Added `trigger/generate-architecture.ts` so `trigger:dev` finds a product task instead of failing with no trigger files |
