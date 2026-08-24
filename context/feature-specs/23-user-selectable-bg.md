Read `AGENTS.md` before starting.

We are updating the existing design system to support user-selectable background themes.

The current application uses a dark-only theme defined in `global.css`. Refactor the color system into a centralized theme system that allows users to select different background themes.

## Important Rules

- Do not use hardcoded background colors directly inside components.
- Components must continue to use semantic Tailwind tokens such as:

  - `bg-base`
  - `bg-surface`
  - `bg-elevated`
  - `text-copy`
  - `text-copy-muted`
  - `border-surface-border`
  - `text-brand`
  - `bg-accent-dim`
- Theme switching must happen by changing CSS custom property values.
- Components should not need to know which theme is active.
- Do not modify the generated `components/ui/-*` files unless absolutely necessary.
- Preserve the existing dark theme as the default.
- Do not break existing UI, functionality, or design tokens.

## Theme Architecture

Create a centralized theme system.

Define semantic CSS variables in `global.css` and map them to Tailwind tokens using `@theme inline`.

The default theme should remain the current dark theme.

Add multiple predefined themes:

- `dark`
- `light`
- `midnight`
- `ocean`
- `forest`

The themes should change the following semantic tokens:

- `--bg-base`
- `--bg-surface`
- `--bg-elevated`
- `--border`
- `--border-default`
- `--border-subtle`
- `--text-primary`
- `--text-secondary`
- `--text-muted`
- `--text-faint`
- `--accent-primary`
- `--accent-primary-dim`
- `--accent-ai`
- `--accent-ai-text`
- `--state-error`
- `--state-success`
- `--state-warning`

Example structure:

```css
:root,
[data-theme="dark"] {
  --bg-base: #080809;
  --bg-surface: #111114;
  --bg-elevated: #18181c;

  --text-primary: #f0f0f4;
  --text-secondary: #c0c0cc;
  --text-muted: #808090;

  --accent-primary: #00c8d4;
  --accent-primary-dim: rgba(0, 200, 212, 0.12);
}

[data-theme="light"] {
  /* Light theme values */
}

[data-theme="midnight"] {
  /* Midnight theme values */
}

[data-theme="ocean"] {
  /* Ocean theme values */
}

[data-theme="forest"] {
  /* Forest theme values */
}
```

## Tailwind Token Mapping

Continue mapping CSS variables through `@theme inline`.

Example:

```css
@theme inline {
  --color-base: var(--bg-base);
  --color-surface: var(--bg-surface);
  --color-elevated: var(--bg-elevated);

  --color-copy: var(--text-primary);
  --color-copy-muted: var(--text-muted);

  --color-brand: var(--accent-primary);
  --color-accent-dim: var(--accent-primary-dim);
}
```

Existing components should continue using semantic classes such as:

```tsx
<div className="bg-base text-copy">
```

and:

```tsx
<Card className="bg-surface border-surface-border">
```

Do not replace semantic tokens with theme-specific or hardcoded colors.

## Theme Configuration

Create a reusable theme configuration file.

For example:

```text
lib/themes.ts
```

The configuration should contain:

* Theme ID
* Theme name
* Theme description
* Theme preview color

Example:

```ts
export const THEMES = [
  {
    id: "dark",
    name: "Dark",
    description: "Default dark workspace",
    preview: "#080809",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep blue-black workspace",
    preview: "#0b1020",
  },
];
```

Use TypeScript types so adding new themes is simple.

## Theme Provider

Create a reusable theme provider.

The provider should:

1. Load the saved theme from `localStorage`.
2. Use `dark` as the default theme.
3. Apply the selected theme to the root HTML element:

```ts
document.documentElement.dataset.theme = theme;
```

4. Persist theme changes to `localStorage`.
5. Expose:

   - Current theme
   - `setTheme()`
   - Available themes

The provider should avoid hydration issues in Next.js.

## Theme Selector

Create a theme selector component that allows users to select a theme.

The selector should:

- Display all available themes.
- Show the currently active theme.
- Show a visual preview for each theme.
- Update the application immediately when selected.
- Persist the user's selection.
- Match the existing design system.
- Use existing shadcn/ui components where appropriate.

Suggested structure:

```text
components/theme/
  theme-provider.tsx
  theme-selector.tsx
```

## Custom Background Color

Also support a custom background color.

The user should be able to choose a custom background color, which overrides `--bg-base`.

The custom color should:

- Update immediately.
- Be stored in `localStorage`.
- Be restored after refresh.
- Work together with the selected theme.

Do not allow the custom background color to accidentally override surface, text, border, or accent colors.

## Canvas

The existing canvas node palette in `types/canvas.ts` must remain unchanged.

Do not apply the global theme system to:

- `NODE_COLORS`
- Node-specific fill colors
- Node-specific text colors
- Edge stroke colors

The application theme should control the workspace UI, while node colors remain independent.

## Check When Done

- `AGENTS.md` was read before making changes.
- The existing dark theme remains visually unchanged by default.
- Users can select a different theme.
- Users can select a custom page background color.
- Theme selection persists after refresh.
- Existing components automatically update when the theme changes.
- No hardcoded theme colors are added to components.
- Semantic Tailwind tokens are used throughout.
- No hydration errors occur.
- No default shadcn light styling appears.
- Existing canvas node colors remain unchanged.
- All components import without errors.
- TypeScript passes.
- The application builds successfully.
- `npm ci`, `npm run lint`, and `npm run build` pass.
