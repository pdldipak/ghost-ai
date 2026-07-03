# Code Standers

## General
- Keep modules small and single-purpose.
- Fix root cause - do not layer woarkarounds. 
- Do not mix unrelated concern in one component or route.
- Respect the system boundaries defined in `architecture-context.md`.

## TypeScript
- Strict mode is required throughout the project. 
- Avoid `any`; use explict interfaces or narrowly scoped types. 
- Validate unknown external input at system boundaries before trusting it. 
- Use `interface` for object contracts. 

## Next.js 
- Default to React Server Components. 
- Add `"use Client"` only when the component needs browser interactivity, hooks, or real-time state. 
- Keep route handlers focused on a single responsibility. 
- Long-running work belongs in background tasks, not in request handlers. 

## Styling 
- Use CSS custom property tokens defined in global.css - no raw Tailwind color classes like `zinc-*` or hardcoded hex values. 
- Reference tokens through their Tailwind utility names: ``bg-base`, `text-copy`, `primary`, `border-surface-border`, `text-brand`, etc. 
- Maintain the border radius scale: `rounded-xl` for small elements, `rounded-2xl` for cards, `rounded-3xl` for modals. 

## API Roues
- Validate and parse request input before any logic runs. 
- Enforce auth and project ownership checks before any mutation. 
- Return consistent, predictable response shapes. 

## Data and Storage
- Project metadata and relationships belong in PostgreSQL via Prisma. 
- Canvas snapshots and generated specs belong in Vercel Blob; Prisma stores only the blob URL reference. 
- Do not store large generated content directly in the database. 
- Task run records are first-class relational data - treat ownership and run IDs as verified before any token issuance. 

## File Organization 
- `lib/` - shared infrastructure: Prisma client, auth helpers, utilities. 
- `trigger/` - all durable background tasks and AI workfloes. 
- `components` - UI composition only; no business logic 
- `app/api/` - route handlers for auth, triggering, and persistance. 
- Name files after the responsibility they contain, not the technology. 
