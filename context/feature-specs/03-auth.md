Clerk is already installed, configured, and connected. The initial Clerk setup has already been completed. Do not reinstall, reconfigure, or replace the existing Clerk setup. Reuse the current environment variables and configuration. Wire it into the Next.js app: provider, auth pages, redirects, route protection, and user menu and formate as mentioned. 



## Design 
Use Clerk's `dark` theme from `@clerk/ui/themes` as the base. 

Override Clerk apperance variables using the app's existing CSS variables. Do nit hardcode colors. 

### Sign-in and sign-up pages: 

- large screens: simple two-panel layout
- left: compact logo, tagline, short text-only feature list
- right: centered Clerk form 
- small screens: form only 
- no gradients
- no oversized hero sections 
- no feature cards
- no scroll-heavy layouts

Keep the layout minimal and professional. 

## Implementation

Wrap the root layout with `ClerkProvider` using Clerk's `dark` theme. 

Create sign-in and sign-up pages using Clerk components (if they are already created just renamen as suggested)

Use `proxy.ts` at the project root. not `middleware.ts` (is already created)

Define public routes using the existing sign-in and sign-up env vars. Protect everything else by default. 

Update `/`:

- authenticated users redirect to `/editor`
- unauthenticated users redirect to `/sign-in`

Add Clerk's built-in `UserButton` to the editor navbar right section for profile settings and logout. 

Keep Clerk's default user menu and profile flows intact. Do not rebuild or heavily customize Clerk internals. 

Use existing Clerk env vars. Do not rename or invent new ones. 

## Dependencies

install: @clerk/ui. 

## Check When Done 

- `prox.ts` exists at the root
- all routes are protected expect public auth paths
- auth pages use CSS variables with no hardcoded colors 
- `ClerkProvider` wraps the root layout 
- `npm run build` passes

