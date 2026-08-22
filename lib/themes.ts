export const THEME_IDS = [
  "dark",
  "light",
  "midnight",
  "ocean",
  "forest",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  preview: string;
}

export const DEFAULT_THEME_ID: ThemeId = "dark";

export const THEME_STORAGE_KEY = "ghost-ai-theme";
export const CUSTOM_BG_STORAGE_KEY = "ghost-ai-custom-bg";

export const CUSTOM_BG_PATTERN = /^#[0-9a-fA-F]{6}$/;

export const THEMES: readonly ThemeDefinition[] = [
  {
    id: "dark",
    name: "Dark",
    description: "Default dark workspace",
    preview: "#080809",
  },
  {
    id: "light",
    name: "Light",
    description: "Bright workspace",
    preview: "#f4f4f6",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep blue-black workspace",
    preview: "#0b1020",
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Deep teal workspace",
    preview: "#061418",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Deep green workspace",
    preview: "#0a120e",
  },
];

export function isThemeId(value: string): value is ThemeId {
  return (THEME_IDS as readonly string[]).includes(value);
}

export function parseThemeId(value: string | null): ThemeId {
  if (value && isThemeId(value)) {
    return value;
  }

  return DEFAULT_THEME_ID;
}

export function parseCustomBackground(value: string | null): string | null {
  if (value && CUSTOM_BG_PATTERN.test(value)) {
    return value;
  }

  return null;
}

export function getThemeDefinition(id: ThemeId): ThemeDefinition {
  const match = THEMES.find((theme) => theme.id === id);
  return match ?? THEMES[0];
}

export function applyDocumentTheme(
  theme: ThemeId,
  customBackground: string | null,
): void {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.add("dark");

  if (customBackground) {
    root.style.setProperty("--bg-base", customBackground);
  } else {
    root.style.removeProperty("--bg-base");
  }
}

export function readStoredTheme(): ThemeId {
  try {
    return parseThemeId(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME_ID;
  }
}

export function readStoredCustomBackground(): string | null {
  try {
    return parseCustomBackground(localStorage.getItem(CUSTOM_BG_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function persistTheme(theme: ThemeId): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage should not break theme switching.
  }
}

export function persistCustomBackground(color: string | null): void {
  try {
    if (color) {
      localStorage.setItem(CUSTOM_BG_STORAGE_KEY, color);
    } else {
      localStorage.removeItem(CUSTOM_BG_STORAGE_KEY);
    }
  } catch {
    // Private mode or blocked storage should not break theme switching.
  }
}

export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var allowed=${JSON.stringify(THEME_IDS)};var theme=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(allowed.indexOf(theme)===-1)theme=${JSON.stringify(DEFAULT_THEME_ID)};document.documentElement.dataset.theme=theme;document.documentElement.classList.add("dark");var custom=localStorage.getItem(${JSON.stringify(CUSTOM_BG_STORAGE_KEY)});if(custom&&${CUSTOM_BG_PATTERN.toString()}.test(custom)){document.documentElement.style.setProperty("--bg-base",custom);}}catch(e){}})();`;
