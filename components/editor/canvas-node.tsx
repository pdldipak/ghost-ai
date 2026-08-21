"use client";

import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react";

import { NodeLabel } from "@/components/editor/node-label";
import { NodeShapeVisual } from "@/components/editor/node-shape";
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_SHAPE,
  getNodeTextColor,
  NODE_MIN_HEIGHT,
  NODE_MIN_WIDTH,
  type CanvasNode,
} from "@/types/canvas";

export function CanvasNodeView({ id, data, selected }: NodeProps<CanvasNode>) {
  const fill = data.color || DEFAULT_NODE_COLOR;
  const textColor = getNodeTextColor(fill);

  return (
    <div className="relative h-full w-full">
      <NodeResizer
        isVisible={Boolean(selected)}
        minWidth={NODE_MIN_WIDTH}
        minHeight={NODE_MIN_HEIGHT}
        color="var(--accent-primary)"
        handleClassName="!z-20 !h-1.5 !w-1.5 !rounded-sm !border-base !bg-brand"
        lineClassName="!z-20 !border-brand/30"
      />
      <NodeShapeVisual
        shape={data.shape ?? DEFAULT_NODE_SHAPE}
        fill={fill}
        textColor={textColor}
        selected={Boolean(selected)}
        label={data.label}
        labelContent={<NodeLabel nodeId={id} label={data.label} />}
      />
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
