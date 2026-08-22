"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  applyDocumentTheme,
  DEFAULT_THEME_ID,
  persistCustomBackground,
  persistTheme,
  readStoredCustomBackground,
  readStoredTheme,
  THEMES,
  type ThemeDefinition,
  type ThemeId,
} from "@/lib/themes";

interface ThemeState {
  theme: ThemeId;
  customBackground: string | null;
}

interface ThemeContextValue extends ThemeState {
  setTheme: (theme: ThemeId) => void;
  setCustomBackground: (color: string | null) => void;
  themes: readonly ThemeDefinition[];
}

const SERVER_SNAPSHOT: ThemeState = {
  theme: DEFAULT_THEME_ID,
  customBackground: null,
};

let snapshot: ThemeState = { ...SERVER_SNAPSHOT };
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ThemeState {
  return snapshot;
}

function getServerSnapshot(): ThemeState {
  return SERVER_SNAPSHOT;
}

function replaceSnapshot(next: ThemeState): void {
  const changed =
    snapshot.theme !== next.theme ||
    snapshot.customBackground !== next.customBackground;
  snapshot = next;
  applyDocumentTheme(next.theme, next.customBackground);
  if (changed) {
    emit();
  }
}

function hydrateThemeStore(): void {
  replaceSnapshot({
    theme: readStoredTheme(),
    customBackground: readStoredCustomBackground(),
  });
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const state = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useLayoutEffect(() => {
    hydrateThemeStore();
  }, []);

  const setTheme = useCallback((theme: ThemeId) => {
    persistTheme(theme);
    replaceSnapshot({
      theme,
      customBackground: snapshot.customBackground,
    });
  }, []);

  const setCustomBackground = useCallback((color: string | null) => {
    persistCustomBackground(color);
    replaceSnapshot({
      theme: snapshot.theme,
      customBackground: color,
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: state.theme,
      customBackground: state.customBackground,
      setTheme,
      setCustomBackground,
      themes: THEMES,
    }),
    [setCustomBackground, setTheme, state.customBackground, state.theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
