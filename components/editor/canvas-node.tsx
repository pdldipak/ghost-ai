"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

import { NodeShapeVisual } from "@/components/editor/node-shape";
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_SHAPE,
  getNodeTextColor,
  type CanvasNode,
} from "@/types/canvas";

export function CanvasNodeView({ data, selected }: NodeProps<CanvasNode>) {
  const fill = data.color || DEFAULT_NODE_COLOR;
  const textColor = getNodeTextColor(fill);

  return (
    <div className="relative h-full w-full">
      <NodeShapeVisual
        shape={data.shape ?? DEFAULT_NODE_SHAPE}
        fill={fill}
        textColor={textColor}
        selected={Boolean(selected)}
        label={data.label}
      />
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
