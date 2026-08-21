import type { CSSProperties } from "react";
import {
  addEdge,
  MarkerType,
  type Connection,
  type DefaultEdgeOptions,
  type EdgeMarker,
} from "@xyflow/react";

import {
  DEFAULT_EDGE_COLOR,
  EDGE_STROKE_WIDTH,
  type CanvasEdge,
} from "@/types/canvas";

export const CANVAS_EDGE_STYLE: CSSProperties = {
  stroke: DEFAULT_EDGE_COLOR,
  strokeWidth: EDGE_STROKE_WIDTH,
  strokeLinecap: "round",
};

export const CANVAS_EDGE_MARKER: EdgeMarker = {
  type: MarkerType.ArrowClosed,
  color: DEFAULT_EDGE_COLOR,
  width: 16,
  height: 16,
};

export const DEFAULT_CANVAS_EDGE_OPTIONS: DefaultEdgeOptions = {
  type: "canvasEdge",
  data: { label: "" },
  style: CANVAS_EDGE_STYLE,
  markerEnd: CANVAS_EDGE_MARKER,
};

export function createCanvasEdge(connection: Connection): CanvasEdge | null {
  if (!connection.source || !connection.target) {
    return null;
  }

  const [edge] = addEdge<CanvasEdge>(
    {
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: "canvasEdge",
      data: { label: "" },
      style: CANVAS_EDGE_STYLE,
      markerEnd: CANVAS_EDGE_MARKER,
    },
    [],
  );

  return edge ?? null;
}
