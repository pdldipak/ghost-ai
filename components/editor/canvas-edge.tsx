"use client";

import { useCallback, useState, type MouseEvent } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";

import { EdgeLabel } from "@/components/editor/edge-label";
import { CANVAS_EDGE_STYLE } from "@/lib/canvas-edges";
import {
  DEFAULT_EDGE_COLOR,
  EDGE_ACTIVE_OPACITY,
  EDGE_INTERACTION_WIDTH,
  EDGE_REST_OPACITY,
  type CanvasEdge,
} from "@/types/canvas";

export function CanvasEdgeView({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
  style,
}: EdgeProps<CanvasEdge>) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const label = data?.label ?? "";
  const isActive = Boolean(selected) || isHovered || isEditing;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const startEditing = useCallback((event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsEditing(true);
  }, []);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  return (
    <>
      <g
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={startEditing}
      >
        <BaseEdge
          path={edgePath}
          markerEnd={markerEnd}
          interactionWidth={EDGE_INTERACTION_WIDTH}
          style={{
            ...CANVAS_EDGE_STYLE,
            ...style,
            stroke: DEFAULT_EDGE_COLOR,
            opacity: isActive ? EDGE_ACTIVE_OPACITY : EDGE_REST_OPACITY,
          }}
        />
      </g>
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          className="nodrag nopan pointer-events-none"
        >
          <EdgeLabel
            edgeId={id}
            label={label}
            isEditing={isEditing}
            onStartEditing={() => setIsEditing(true)}
            onStopEditing={stopEditing}
          />
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
