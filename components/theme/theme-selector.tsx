"use client";

import { Palette } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { getThemeDefinition, parseCustomBackground } from "@/lib/themes";
import { cn } from "@/lib/utils";

export function ThemeSelector() {
  const {
    theme,
    setTheme,
    customBackground,
    setCustomBackground,
    themes,
  } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const activeTheme = getThemeDefinition(theme);
  const colorValue = customBackground ?? activeTheme.preview;

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Choose appearance"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
      >
        <Palette />
      </Button>

      {open ? (
        <div
          className="absolute top-full right-0 z-50 mt-2 w-72 rounded-2xl border border-surface-border bg-elevated p-2 shadow-lg"
          role="dialog"
          aria-label="Appearance"
        >
          <p className="px-2 pt-1 pb-2 text-xs font-medium tracking-wide text-copy-muted uppercase">
            Theme
          </p>
          <div id={listId} role="listbox" aria-label="Themes" className="space-y-0.5">
            {themes.map((item) => {
              const isActive = item.id === theme;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => setTheme(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left",
                    "hover:bg-surface",
                    isActive && "bg-accent-dim",
                  )}
                >
                  <span
                    className={cn(
                      "size-7 shrink-0 rounded-full border border-surface-border",
                      isActive && "ring-2 ring-brand ring-offset-2 ring-offset-elevated",
                    )}
                    style={{ backgroundColor: item.preview }}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-copy">
                      {item.name}
                    </span>
                    <span className="block text-xs text-copy-muted">
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-2 border-t border-surface-border px-2 pt-3 pb-1">
            <p className="text-xs font-medium tracking-wide text-copy-muted uppercase">
              Page background
            </p>
            <div className="mt-2 flex items-center gap-2">
              <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-surface-border bg-surface px-2 py-1.5">
                <input
                  type="color"
                  value={colorValue}
                  aria-label="Custom page background"
                  className="size-6 shrink-0 cursor-pointer rounded-lg border border-surface-border bg-transparent p-0"
                  onChange={(event) => {
                    const next = parseCustomBackground(event.target.value);
                    if (next) {
                      setCustomBackground(next);
                    }
                  }}
                />
                <span className="truncate text-sm text-copy">
                  {customBackground ?? "Theme default"}
                </span>
              </label>
              {customBackground ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCustomBackground(null)}
                >
                  Reset
                </Button>
              ) : null}
            </div>
            <p className="mt-2 pb-1 text-xs text-copy-faint">
              Overrides the page background only.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
