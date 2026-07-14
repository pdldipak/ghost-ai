import { dark } from "@clerk/ui/themes";

export const clerkAppearance = {
  theme: dark,
  variables: {
    colorBackground: "var(--card)",
    colorDanger: "var(--destructive)",
    colorForeground: "var(--card-foreground)",
    colorInput: "var(--input)",
    colorInputForeground: "var(--card-foreground)",
    colorModalBackdrop:
      "color-mix(in srgb, var(--background), transparent 50%)",
    colorMuted: "var(--muted)",
    colorMutedForeground: "var(--muted-foreground)",
    colorNeutral: "var(--foreground)",
    colorPrimary: "var(--primary)",
    colorPrimaryForeground: "var(--primary-foreground)",
    colorRing: "color-mix(in srgb, var(--ring), transparent 50%)",
    fontFamily: "var(--font-geist-sans)",
    fontFamilyButtons: "var(--font-geist-sans)",
    fontFamilyMono: "var(--font-geist-mono)",
    borderRadius: "var(--radius)",
  },
  elements: {
    cardBox: "shadow-none border border-surface-border rounded-2xl",
    headerTitle: "text-copy",
    headerSubtitle: "text-copy-muted",
    socialButtonsBlockButton:
      "border border-surface-border bg-elevated text-copy",
    formFieldLabel: "text-copy",
    footerActionLink: "text-brand",
  },
};
