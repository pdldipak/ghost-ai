import type { Edge, Node } from "@xyflow/react";

/** Canvas node fill/text pairs for the dark workspace (see ui-context.md). */
export const NODE_COLORS = [
  { fill: "#1F1F1F", text: "#EDEDED", label: "Neutral dark" },
  { fill: "#10233D", text: "#52A8FF", label: "Blue" },
  { fill: "#2E1938", text: "#BF7AF0", label: "Purple" },
  { fill: "#331B00", text: "#FF990A", label: "Orange" },
  { fill: "#3C1618", text: "#FF6166", label: "Red" },
  { fill: "#3A1726", text: "#F75F8F", label: "Pink" },
  { fill: "#0F2E18", text: "#3DD68C", label: "Green" },
  { fill: "#062822", text: "#0AC7B4", label: "Teal" },
] as const;

export type NodeColorFill = (typeof NODE_COLORS)[number]["fill"];

export const DEFAULT_NODE_COLOR: NodeColorFill = "#1F1F1F";

export const NODE_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const;

export type NodeShape = (typeof NODE_SHAPES)[number];

export const DEFAULT_NODE_SHAPE: NodeShape = "rectangle";

export const SHAPE_DEFAULT_SIZES: Record<
  NodeShape,
  { width: number; height: number }
> = {
  rectangle: { width: 180, height: 80 },
  diamond: { width: 140, height: 140 },
  circle: { width: 100, height: 100 },
  pill: { width: 180, height: 64 },
  cylinder: { width: 140, height: 100 },
  hexagon: { width: 140, height: 120 },
};

export const SHAPE_DRAG_MIME = "application/ghost-shape";

export interface ShapeDragPayload {
  shape: NodeShape;
  width: number;
  height: number;
}

export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  color: NodeColorFill;
  shape: NodeShape;
}

export type CanvasNode = Node<CanvasNodeData, "canvasNode">;

export type CanvasEdge = Edge<Record<string, never>, "canvasEdge">;

export const DEFAULT_EDGE_COLOR = "#f8fafc";

export function getNodeTextColor(fill: NodeColorFill): string {
  const match = NODE_COLORS.find((color) => color.fill === fill);
  return match?.text ?? NODE_COLORS[0].text;
}
