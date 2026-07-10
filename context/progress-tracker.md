## Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Foundation — editor base chrome complete; ready for next feature unit

## Current Goal

- Pick up the next feature from `feature-specs/`.

## Completed

- Design system and UI primitives (`feature-specs/01-design-system.md`): shadcn/ui configured, dark theme tokens in `globals.css`, `lib/utils.ts` with `cn()`, lucide-react installed, Button/Card/Dialog/Input/Tabs/Textarea/ScrollArea added under `components/ui/`.
- Editor base chrome (`feature-specs/02-editor.md`): `EditorNavbar` with sidebar toggle, `ProjectSidebar` floating shell with My Projects/Shared tabs, and `EditorDialog` pattern for future dialogs.
- Clerk authentication: CLI-linked app, `@clerk/nextjs` with `proxy.ts` protection, sign-in/sign-up routes, shadcn-themed provider, and `AuthControls` in home header and editor navbar.

## In Progress

- None.

## Next Up

- Next feature unit from `feature-specs/` (TBD).

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions
Feature 01: 
- **UI foundation:** shadcn/ui (base-nova preset) on Tailwind v4 + Base UI primitives + Lucide icons. Generated primitives live in `components/ui/*` and must not be modified after install.
- **Theming:** Dark-only — no light mode. Project color tokens (`--bg-base`, `--accent-primary`, etc.) are defined in `globals.css` and exposed as Tailwind utilities via `@theme inline`. shadcn semantic tokens (`--background`, `--primary`, etc.) map to those project tokens.
- **Class merging:** `lib/utils.ts` exports `cn()` (`clsx` + `tailwind-merge`) as the standard helper for conditional Tailwind classes.
Feature 02:
- **Editor chrome:** App-level editor components live in `components/editor/` and compose shadcn primitives; the project sidebar floats above the canvas (fixed overlay, no layout push).
- **Auth:** Clerk via `@clerk/nextjs`; `proxy.ts` protects non-public routes; sign-in/sign-up at `/sign-in` and `/sign-up`; `AuthControls` component surfaces sign-in, sign-up, and user menu.

## Session Notes

- Editor chrome is ready to wire into an editor route/layout when the canvas feature lands.
