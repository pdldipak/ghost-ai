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
