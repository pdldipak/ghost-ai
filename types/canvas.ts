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

export type NodeShape = "rectangle" | "rounded" | "circle" | "diamond";

export const DEFAULT_NODE_SHAPE: NodeShape = "rounded";

export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  color: NodeColorFill;
  shape: NodeShape;
}

export type CanvasNode = Node<CanvasNodeData, "canvasNode">;

export type CanvasEdge = Edge<Record<string, never>, "canvasEdge">;

export const DEFAULT_EDGE_COLOR = "#f8fafc";
