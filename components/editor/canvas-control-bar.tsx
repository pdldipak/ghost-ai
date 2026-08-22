"use client";

import { useCallback } from "react";
import {
  useCanRedo,
  useCanUndo,
  useRedo,
  useUndo,
} from "@liveblocks/react/suspense";
import { useReactFlow } from "@xyflow/react";
import { Maximize2, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react";

import {
  CANVAS_ZOOM_DURATION_MS,
  useKeyboardShortcuts,
} from "@/hooks/use-keyboard-shortcuts";
import { cn } from "@/lib/utils";

const controlButtonClassName = cn(
  "flex size-8 items-center justify-center rounded-full text-copy-muted transition-colors",
  "hover:bg-elevated hover:text-copy",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
  "disabled:pointer-events-none disabled:opacity-40",
);

export function CanvasControlBar() {
  const reactFlow = useReactFlow();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  useKeyboardShortcuts({
    reactFlow,
    onUndo: undo,
    onRedo: redo,
  });

  const zoomIn = useCallback(() => {
    void reactFlow.zoomIn({ duration: CANVAS_ZOOM_DURATION_MS });
  }, [reactFlow]);

  const zoomOut = useCallback(() => {
    void reactFlow.zoomOut({ duration: CANVAS_ZOOM_DURATION_MS });
  }, [reactFlow]);

  const fitView = useCallback(() => {
    void reactFlow.fitView({ duration: CANVAS_ZOOM_DURATION_MS });
  }, [reactFlow]);

  return (
    <div className="pointer-events-none absolute bottom-4 left-20 z-20">
      <div
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-surface-border bg-surface px-2 py-1.5"
        role="toolbar"
        aria-label="Canvas controls"
      >
        <button
          type="button"
          aria-label="Zoom out"
          title="Zoom out"
          onClick={zoomOut}
          className={controlButtonClassName}
        >
          <ZoomOut className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Fit view"
          title="Fit view"
          onClick={fitView}
          className={controlButtonClassName}
        >
          <Maximize2 className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom in"
          title="Zoom in"
          onClick={zoomIn}
          className={controlButtonClassName}
        >
          <ZoomIn className="size-4" />
        </button>
        <div
          className="mx-1 h-4 w-px bg-surface-border"
          aria-hidden
        />
        <button
          type="button"
          aria-label="Undo"
          title="Undo"
          onClick={undo}
          disabled={!canUndo}
          className={controlButtonClassName}
        >
          <Undo2 className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Redo"
          title="Redo"
          onClick={redo}
          disabled={!canRedo}
          className={controlButtonClassName}
        >
          <Redo2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
