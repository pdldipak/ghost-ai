## Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Foundation — Node shapes and shape drag preview on the collaborative canvas; ready for next feature unit

## Current Goal

- Pick up the next feature from `feature-specs/`.

## Completed

- Design system and UI primitives (`feature-specs/01-design-system.md`): shadcn/ui configured, dark theme tokens in `globals.css`, `lib/utils.ts` with `cn()`, lucide-react installed, Button/Card/Dialog/Input/Tabs/Textarea/ScrollArea added under `components/ui/`.
- Editor base chrome (`feature-specs/02-editor.md`): `EditorNavbar` with sidebar toggle, `ProjectSidebar` floating shell with My Projects/Shared tabs, and `EditorDialog` pattern for future dialogs.
- Clerk authentication (`feature-specs/03-auth.md`): `@clerk/ui` dark theme with CSS-variable overrides, two-panel auth pages, env-driven public routes in `proxy.ts`, `/` redirects (auth → `/editor`, unauth → `/sign-in`), `/editor` shell route, and `UserButton` in editor navbar.
- Project dialogs and editor home (`feature-specs/04-project-dialogs.md`): `EditorHome` with New Project CTA, create/rename/delete dialogs with slug preview, `useProjectDialogs` hook, mock project data, sidebar rename/delete actions (owned only), and mobile sidebar backdrop scrim.
- Prisma data layer (`feature-specs/05-prisma.md`): `Project` and `ProjectCollaborator` models in `prisma/models/project.prisma`, cached singleton in `lib/prisma.ts` (Accelerate vs `@prisma/adapter-pg`), and initial migration applied.
- Project APIs (`feature-specs/06-project-apis.md`): REST routes for list/create/rename/delete under `app/api/projects`; Clerk `userId` as `ownerId`; default name `Untitled Project`; owner-only rename/delete with `401`/`403`; backend-only (UI still mock).
- Wire editor home (`feature-specs/07-wire-editor-home.md`): server-fetched owned/shared projects via `lib/projects.ts`; `useProjectActions` for create/rename/delete against real APIs; room ID = project ID (`slug-suffix`); create navigates to `/editor/[projectId]`; rename refreshes; delete redirects to `/editor` when active workspace deleted.
- Editor workspace shell (`feature-specs/08-editor-workspace-shell.md`): server-side access checks on `/editor/[projectId]` via `lib/project-access.ts`; `AccessDenied` for missing/unauthorized projects; full-viewport workspace with project name navbar, share + AI toggle stubs, canvas placeholder, and right AI sidebar placeholder.
- Share dialog (`feature-specs/09-share-dialog.md`): Share button opens dialog from workspace; owners invite/remove collaborators by email and copy project link with temporary `Copied!` feedback; collaborators see read-only list; `GET`/`POST`/`DELETE` `/api/projects/[projectId]/collaborators` with owner-only invite/remove; Clerk Backend API enriches names/avatars with email fallback; no local user table.
- Liveblocks setup (`feature-specs/10-liveblocks-setup.md`): typed `liveblocks.config.ts` Presence/UserMeta; cached `@liveblocks/node` client and deterministic cursor-color helper in `lib/liveblocks.ts`; `POST /api/liveblocks-auth` verifies Clerk + project access, `getOrCreateRoom` by project ID, and returns a session token with name/avatar/color (`403` when unauthorized).
- Base canvas (`feature-specs/11-base-canvas.md`): workspace placeholder replaced with `CanvasRoom` (`LiveblocksProvider` + `RoomProvider` + suspense/error fallbacks) and `FlowCanvas` (`useLiveblocksFlow` + React Flow with loose connections, `fitView`, MiniMap, dot background); shared `types/canvas.ts` with `NODE_COLORS`, `canvasNode`/`canvasEdge` types.
- Shape panel (`feature-specs/12-shape-panel.md`): floating bottom-center pill toolbar with draggable rectangle/diamond/circle/pill/cylinder/hexagon; drop creates `canvasNode` nodes via Liveblocks `onNodesChange`; basic `CanvasNodeView` renderer.
- Node shapes (`feature-specs/13-node-shape.md`): `CanvasNodeView` renders CSS shapes (rectangle/pill/circle) and scaling SVG shapes (diamond/hexagon/cylinder) from Liveblocks node data; dragging a shape from the panel shows a ghost preview at the default drop size that follows the cursor and hides on drop or cancel.

## In Progress

- None.

## Next Up

- Next feature unit from `feature-specs/` (TBD).

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions (add feature number)
Feature 01: 
- **UI foundation:** shadcn/ui (base-nova preset) on Tailwind v4 + Base UI primitives + Lucide icons. Generated primitives live in `components/ui/*` and must not be modified after install.
- **Theming:** Dark-only — no light mode. Project color tokens (`--bg-base`, `--accent-primary`, etc.) are defined in `globals.css` and exposed as Tailwind utilities via `@theme inline`. shadcn semantic tokens (`--background`, `--primary`, etc.) map to those project tokens.
- **Class merging:** `lib/utils.ts` exports `cn()` (`clsx` + `tailwind-merge`) as the standard helper for conditional Tailwind classes.
Feature 02:
- **Editor chrome:** App-level editor components live in `components/editor/` and compose shadcn primitives; the project sidebar floats above the canvas (fixed overlay, no layout push).
Feature 03:
- **Auth:** Clerk via `@clerk/nextjs`; `proxy.ts` protects non-public routes using `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL`; sign-in/sign-up use two-panel `AuthPageLayout` with Clerk `dark` theme and CSS-variable appearance overrides; `/` redirects by auth state; `UserButton` in editor navbar.
Feature 04:
- **Project dialogs:** Mock-only project state managed by `hooks/use-project-dialogs.ts`; slug preview via `lib/project-slug.ts`; dialogs compose `EditorDialog`; sidebar actions gated on `isOwned`; mobile backdrop closes sidebar on outside tap.
Feature 05:
- **Prisma:** Multi-file schema under `prisma/` with `Project` (ownerId, status enum, canvasJsonPath, indexes) and `ProjectCollaborator` (cascade delete, unique project/email); client generated to `app/generated/prisma`; `lib/prisma.ts` branches on `DATABASE_URL` — Accelerate when `prisma+postgress://`, otherwise `@prisma/adapter-pg`; dev singleton cached on `global`.
Feature 06:
- **Project APIs:** Authenticated REST handlers in `app/api/projects` and `app/api/projects/[projectId]`; create uses Prisma `cuid()` IDs and sets `canvasJsonPath` to `canvas/{projectId}.json`; list scoped to `ownerId`; rename/delete require ownership (`403` for non-owners, `401` when unauthenticated).
Feature 07:
- **Editor ↔ API wiring:** `/editor` and `/editor/[projectId]` are server components that load owned/shared projects via `lib/projects.ts` (no client initial fetch). `useProjectActions` owns dialog state and calls create/rename/delete APIs. Create generates a room ID as `slugify(name)-suffix`, sends it as project `id` so project ID and Liveblocks room ID stay aligned, then navigates to `/editor/{id}`. Rename uses `router.refresh()`; delete redirects to `/editor` when the active workspace is removed.
Feature 08:
- **Workspace shell + access:** `/editor/[projectId]` checks Clerk identity and project membership (owner or collaborator email) via `lib/project-access.ts` before render; unauthenticated users redirect to `/sign-in`; missing/unauthorized projects render `AccessDenied`. Workspace layout is full-viewport with project name in the navbar, no-op share and AI sidebar toggles, dark canvas placeholder, and a collapsible right AI sidebar placeholder — no Liveblocks, canvas, or chat logic yet.
Feature 09:
- **Share + collaborators:** Collaborators stored by normalized email in `ProjectCollaborator` only (no local user table). List/invite/remove via `/api/projects/[projectId]/collaborators`; invite and remove are owner-only server-side. List enrichment uses Clerk Backend `users.getUserList({ emailAddress })` for display name and avatar, falling back to email-only when no Clerk user exists. Share UI is `ShareProjectDialog` + `useShareDialog`, opened from the workspace navbar Share button; owners can invite/remove and copy link, collaborators get a read-only list.
Feature 10:
- **Liveblocks infra:** Access-token auth via `prepareSession` (session token). Room ID equals project ID. Rooms are created on demand with private `defaultAccesses: []`; write access granted only after `getAccessibleProject` succeeds. Cursor color is a deterministic hash of Clerk `userId` into a fixed palette. Presence types include `cursor` and `isThinking`; UserMeta `info` carries `name`, `avatar`, and `color`.
Feature 11:
- **Base canvas:** Client-only `CanvasRoom` wraps workspace canvas with `LiveblocksProvider` (`/api/liveblocks-auth`), `RoomProvider` (room ID = project ID, `initialPresence` `{ cursor: null, isThinking: false }`), `ErrorBoundary`, and `ClientSideSuspense`. `FlowCanvas` syncs empty nodes/edges via `useLiveblocksFlow` (suspense) into React Flow with `ConnectionMode.Loose`, `fitView`, MiniMap, and dotted `Background`. Shared schema in `types/canvas.ts`: `NODE_COLORS`, `CanvasNodeData` (`label`/`color`/`shape`), typed `canvasNode` / `canvasEdge`. No Controls, custom renderers, blob persistence, or AI yet. Workspace page remains a server component.
Feature 12:
- **Shape panel:** Floating pill toolbar at the bottom-center of the canvas with draggable shapes (`rectangle`, `diamond`, `circle`, `pill`, `cylinder`, `hexagon`). Drag payload (`SHAPE_DRAG_MIME`) includes shape plus default size from `SHAPE_DEFAULT_SIZES`. Drop on the canvas wrapper converts screen coordinates with `screenToFlowPosition` and adds a Liveblocks-synced node via `onNodesChange({ type: "add" })`. New nodes use type `canvasNode`, empty label, `DEFAULT_NODE_COLOR`, the dragged shape, and IDs `{shape}-{timestamp}-{counter}`. `CanvasNodeView` renders every shape as a bordered rectangle with a centered label; shape-specific visuals are deferred.
Feature 13:
- **Node shape rendering:** Shared `NodeShapeVisual` draws rectangle/pill/circle with CSS radius and diamond/hexagon/cylinder with `preserveAspectRatio="none"` SVG so shapes scale with node width/height. Stroke uses `--border-default` at rest and `--accent-primary` when selected (`vector-effect: non-scaling-stroke`). `CanvasNodeView` still reads Liveblocks `canvasNode` data (`shape`, `color`, `label`) and does not change drop/create behavior.
- **Shape drag preview:** `useShapeDragPreview` hides the native drag ghost and portals a 50% opacity preview of the dragged shape at `SHAPE_DEFAULT_SIZES`, following the cursor until `drop` or `dragend`. Preview is pointer-events-none so canvas drop handling is unchanged.

## Session Notes

- Room ID remains the project ID (`/editor/[projectId]`); feature 08 refers to this as the room route.
