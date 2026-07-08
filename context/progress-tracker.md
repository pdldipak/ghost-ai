## Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Foundation — design system complete; ready for next feature unit

## Current Goal

- Pick up the next feature from `feature-specs/`.

## Completed

- Design system and UI primitives (`feature-specs/01-design-system.md`): shadcn/ui configured, dark theme tokens in `globals.css`, `lib/utils.ts` with `cn()`, lucide-react installed, Button/Card/Dialog/Input/Tabs/Textarea/ScrollArea added under `components/ui/`.

## In Progress

- None.

## Next Up

- Next feature unit from `feature-specs/` (TBD).

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- **UI foundation:** shadcn/ui (base-nova preset) on Tailwind v4 + Base UI primitives + Lucide icons. Generated primitives live in `components/ui/*` and must not be modified after install.
- **Theming:** Dark-only — no light mode. Project color tokens (`--bg-base`, `--accent-primary`, etc.) are defined in `globals.css` and exposed as Tailwind utilities via `@theme inline`. shadcn semantic tokens (`--background`, `--primary`, etc.) map to those project tokens.
- **Class merging:** `lib/utils.ts` exports `cn()` (`clsx` + `tailwind-merge`) as the standard helper for conditional Tailwind classes.

## Session Notes

- Add context needed to resume work in the next session.