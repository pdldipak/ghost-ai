"use client";

import type { DragEvent } from "react";

import { getShapeDragPayload } from "@/lib/canvas-nodes";
import { cn } from "@/lib/utils";
import {
  NODE_SHAPES,
  SHAPE_DRAG_MIME,
  type NodeShape,
} from "@/types/canvas";

const SHAPE_LABELS: Record<NodeShape, string> = {
  rectangle: "Rectangle",
  diamond: "Diamond",
  circle: "Circle",
  pill: "Pill",
  cylinder: "Cylinder",
  hexagon: "Hexagon",
};

function ShapeIcon({ shape }: { shape: NodeShape }) {
  const className = "size-4";

  switch (shape) {
    case "rectangle":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <rect
            x="3"
            y="6"
            width="18"
            height="12"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.75"
          />
        </svg>
      );
    case "diamond":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <path
            d="M12 3 21 12 12 21 3 12Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "circle":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <circle
            cx="12"
            cy="12"
            r="8"
            stroke="currentColor"
            strokeWidth="1.75"
          />
        </svg>
      );
    case "pill":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <rect
            x="3"
            y="7"
            width="18"
            height="10"
            rx="5"
            stroke="currentColor"
            strokeWidth="1.75"
          />
        </svg>
      );
    case "cylinder":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <ellipse
            cx="12"
            cy="6"
            rx="7"
            ry="2.5"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path
            d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6"
            stroke="currentColor"
            strokeWidth="1.75"
          />
        </svg>
      );
    case "hexagon":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <path
            d="M12 3 20 8v8l-8 5-8-5V8Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

function handleShapeDragStart(
  event: DragEvent<HTMLButtonElement>,
  shape: NodeShape,
) {
  const payload = getShapeDragPayload(shape);
  event.dataTransfer.setData(SHAPE_DRAG_MIME, JSON.stringify(payload));
  event.dataTransfer.effectAllowed = "move";
}

export function ShapePanel() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4">
      <div
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-surface-border bg-surface px-2 py-1.5"
        role="toolbar"
        aria-label="Canvas shapes"
      >
        {NODE_SHAPES.map((shape) => (
          <button
            key={shape}
            type="button"
            draggable
            aria-label={`Add ${SHAPE_LABELS[shape]}`}
            title={SHAPE_LABELS[shape]}
            onDragStart={(event) => handleShapeDragStart(event, shape)}
            className={cn(
              "flex size-8 items-center justify-center rounded-full text-copy-muted transition-colors",
              "hover:bg-elevated hover:text-copy",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
              "cursor-grab active:cursor-grabbing",
            )}
          >
            <ShapeIcon shape={shape} />
          </button>
        ))}
      </div>
    </div>
  );
}
