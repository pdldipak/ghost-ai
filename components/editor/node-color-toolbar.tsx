"use client";

import {
  useCallback,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { NodeToolbar, Position, useReactFlow } from "@xyflow/react";

import { cn } from "@/lib/utils";
import { NODE_COLORS, type NodeColorFill } from "@/types/canvas";

interface NodeColorToolbarProps {
  nodeId: string;
  activeFill: NodeColorFill;
}

interface SwatchStyle extends CSSProperties {
  "--swatch-glow": string;
}

export function NodeColorToolbar({
  nodeId,
  activeFill,
}: NodeColorToolbarProps) {
  const { updateNodeData } = useReactFlow();

  const onSelectColor = useCallback(
    (event: MouseEvent<HTMLButtonElement>, fill: NodeColorFill) => {
      event.preventDefault();
      event.stopPropagation();
      updateNodeData(nodeId, { color: fill });
    },
    [nodeId, updateNodeData],
  );

  const stopCanvasPointer = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      event.stopPropagation();
    },
    [],
  );

  return (
    <NodeToolbar
      position={Position.Top}
      offset={12}
      className="nodrag nopan nowheel"
      onPointerDown={stopCanvasPointer}
    >
      <div
        role="toolbar"
        aria-label="Node color"
        className="flex items-center gap-1 rounded-xl border border-surface-border bg-surface px-1.5 py-1"
      >
        {NODE_COLORS.map((color) => {
          const isActive = color.fill === activeFill;

          return (
            <button
              key={color.fill}
              type="button"
              aria-label={color.label}
              aria-pressed={isActive}
              title={color.label}
              onClick={(event) => onSelectColor(event, color.fill)}
              className={cn(
                "size-5 cursor-pointer rounded-full border border-surface-border transition-[box-shadow]",
                "hover:shadow-[0_0_0_1px_var(--swatch-glow),0_0_4px_0_var(--swatch-glow)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
                isActive &&
                  "border-transparent shadow-[0_0_0_1.5px_var(--swatch-glow)] hover:shadow-[0_0_0_1.5px_var(--swatch-glow),0_0_4px_0_var(--swatch-glow)]",
              )}
              style={
                {
                  backgroundColor: color.fill,
                  "--swatch-glow": color.text,
                } as SwatchStyle
              }
            />
          );
        })}
      </div>
    </NodeToolbar>
  );
}
