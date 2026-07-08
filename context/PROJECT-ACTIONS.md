# Project Actions

Chronological history of completed work on **ghost-ai**.

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
