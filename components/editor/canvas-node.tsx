"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

import { cn } from "@/lib/utils";
import {
  DEFAULT_NODE_COLOR,
  getNodeTextColor,
  type CanvasNode,
} from "@/types/canvas";

export function CanvasNodeView({ data, selected }: NodeProps<CanvasNode>) {
  const fill = data.color || DEFAULT_NODE_COLOR;
  const textColor = getNodeTextColor(fill);

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-xl border px-3 py-2 text-center text-sm",
        selected ? "border-brand" : "border-surface-border",
      )}
      style={{ backgroundColor: fill, color: textColor }}
    >
      <span className="truncate">{data.label}</span>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
