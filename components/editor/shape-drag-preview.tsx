"use client";

import { createPortal } from "react-dom";
import type { RefObject } from "react";

import { NodeShapeVisual } from "@/components/editor/node-shape";
import {
  DEFAULT_NODE_COLOR,
  getNodeTextColor,
  type ShapeDragPayload,
} from "@/types/canvas";

interface ShapeDragPreviewProps {
  payload: ShapeDragPayload | null;
  previewRef: RefObject<HTMLDivElement | null>;
}

export function ShapeDragPreview({
  payload,
  previewRef,
}: ShapeDragPreviewProps) {
  if (!payload) {
    return null;
  }

  return createPortal(
    <div
      ref={previewRef}
      className="pointer-events-none fixed top-0 left-0 z-50 opacity-50"
      style={{
        width: payload.width,
        height: payload.height,
        willChange: "transform",
      }}
      aria-hidden
    >
      <NodeShapeVisual
        shape={payload.shape}
        fill={DEFAULT_NODE_COLOR}
        textColor={getNodeTextColor(DEFAULT_NODE_COLOR)}
        selected={false}
        label=""
      />
    </div>,
    document.body,
  );
}
