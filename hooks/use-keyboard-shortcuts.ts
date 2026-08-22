"use client";

import { useEffect } from "react";
import type { ReactFlowInstance } from "@xyflow/react";

export const CANVAS_ZOOM_DURATION_MS = 200;

export interface UseKeyboardShortcutsOptions {
  reactFlow: Pick<ReactFlowInstance, "zoomIn" | "zoomOut">;
  onUndo: () => void;
  onRedo: () => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest(
      "input, textarea, select, [contenteditable]:not([contenteditable='false'])",
    ),
  );
}

export function useKeyboardShortcuts({
  reactFlow,
  onUndo,
  onRedo,
}: UseKeyboardShortcutsOptions): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      const isMod = event.metaKey || event.ctrlKey;

      if (isMod && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          onRedo();
        } else {
          onUndo();
        }
        return;
      }

      if (isMod && event.key.toLowerCase() === "y") {
        event.preventDefault();
        onRedo();
        return;
      }

      if (isMod) {
        return;
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        void reactFlow.zoomIn({ duration: CANVAS_ZOOM_DURATION_MS });
        return;
      }

      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        void reactFlow.zoomOut({ duration: CANVAS_ZOOM_DURATION_MS });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onRedo, onUndo, reactFlow]);
}
