import {
  CANVAS_EDGE_MARKER,
  CANVAS_EDGE_STYLE,
} from "@/lib/canvas-edges";
import { isNodeShape } from "@/lib/canvas-nodes";
import {
  DEFAULT_NODE_COLOR,
  DEFAULT_NODE_SHAPE,
  NODE_COLORS,
  NODE_HANDLE_IDS,
  type CanvasEdge,
  type CanvasNode,
  type NodeColorFill,
  type NodeHandleId,
} from "@/types/canvas";

const NODE_COLOR_FILLS = new Set<string>(
  NODE_COLORS.map((color) => color.fill),
);

const NODE_HANDLE_ID_SET = new Set<string>(NODE_HANDLE_IDS);

export interface CanvasSnapshot {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export function isStoredBlobUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function serializeCanvasSnapshot(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
): CanvasSnapshot {
  return {
    nodes: nodes.map(toPersistedNode),
    edges: edges.map(toPersistedEdge),
  };
}

export function canvasSnapshotKey(snapshot: CanvasSnapshot): string {
  return JSON.stringify(snapshot);
}

export function parseCanvasSnapshot(value: unknown): CanvasSnapshot | null {
  if (!isRecord(value)) {
    return null;
  }

  if (!Array.isArray(value.nodes) || !Array.isArray(value.edges)) {
    return null;
  }

  const nodes: CanvasNode[] = [];
  for (const item of value.nodes) {
    const node = parseCanvasNode(item);
    if (!node) {
      return null;
    }
    nodes.push(node);
  }

  const edges: CanvasEdge[] = [];
  for (const item of value.edges) {
    const edge = parseCanvasEdge(item);
    if (!edge) {
      return null;
    }
    edges.push(edge);
  }

  return { nodes, edges };
}

function toPersistedNode(node: CanvasNode): CanvasNode {
  const label = node.data?.label;
  const color = node.data?.color;
  const shape = node.data?.shape;
  const persisted: CanvasNode = {
    id: node.id,
    type: "canvasNode",
    position: { x: node.position.x, y: node.position.y },
    data: {
      label: typeof label === "string" ? label : "",
      color: isNodeColorFill(color) ? color : DEFAULT_NODE_COLOR,
      shape: isNodeShape(shape) ? shape : DEFAULT_NODE_SHAPE,
    },
  };

  if (isPositiveSize(node.width)) {
    persisted.width = node.width;
  }

  if (isPositiveSize(node.height)) {
    persisted.height = node.height;
  }

  return persisted;
}

function toPersistedEdge(edge: CanvasEdge): CanvasEdge {
  const persisted: CanvasEdge = {
    id: edge.id,
    type: "canvasEdge",
    source: edge.source,
    target: edge.target,
    data: { label: typeof edge.data?.label === "string" ? edge.data.label : "" },
    style: edge.style ?? CANVAS_EDGE_STYLE,
    markerEnd: edge.markerEnd ?? CANVAS_EDGE_MARKER,
  };

  if (typeof edge.sourceHandle === "string") {
    persisted.sourceHandle = edge.sourceHandle;
  }

  if (typeof edge.targetHandle === "string") {
    persisted.targetHandle = edge.targetHandle;
  }

  return persisted;
}

function parseCanvasNode(value: unknown): CanvasNode | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "string" || value.id.length === 0) {
    return null;
  }

  if (value.type !== undefined && value.type !== "canvasNode") {
    return null;
  }

  if (!isPosition(value.position)) {
    return null;
  }

  const data = isRecord(value.data) ? value.data : {};
  const label = typeof data.label === "string" ? data.label : "";
  const color = isNodeColorFill(data.color) ? data.color : DEFAULT_NODE_COLOR;
  const shape = isNodeShape(data.shape) ? data.shape : DEFAULT_NODE_SHAPE;

  const node: CanvasNode = {
    id: value.id,
    type: "canvasNode",
    position: { x: value.position.x, y: value.position.y },
    data: {
      label,
      color,
      shape,
    },
  };

  if (isPositiveSize(value.width)) {
    node.width = value.width;
  }

  if (isPositiveSize(value.height)) {
    node.height = value.height;
  }

  return node;
}

function parseCanvasEdge(value: unknown): CanvasEdge | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "string" || value.id.length === 0) {
    return null;
  }

  if (value.type !== undefined && value.type !== "canvasEdge") {
    return null;
  }

  if (typeof value.source !== "string" || value.source.length === 0) {
    return null;
  }

  if (typeof value.target !== "string" || value.target.length === 0) {
    return null;
  }

  const data = isRecord(value.data) ? value.data : {};
  const label = typeof data.label === "string" ? data.label : "";

  const edge: CanvasEdge = {
    id: value.id,
    type: "canvasEdge",
    source: value.source,
    target: value.target,
    data: { label },
    style: CANVAS_EDGE_STYLE,
    markerEnd: CANVAS_EDGE_MARKER,
  };

  if (isNodeHandleId(value.sourceHandle)) {
    edge.sourceHandle = value.sourceHandle;
  }

  if (isNodeHandleId(value.targetHandle)) {
    edge.targetHandle = value.targetHandle;
  }

  return edge;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPosition(
  value: unknown,
): value is { x: number; y: number } {
  if (!isRecord(value)) {
    return false;
  }

  return isFiniteNumber(value.x) && isFiniteNumber(value.y);
}

function isNodeColorFill(value: unknown): value is NodeColorFill {
  return typeof value === "string" && NODE_COLOR_FILLS.has(value);
}

function isNodeHandleId(value: unknown): value is NodeHandleId {
  return typeof value === "string" && NODE_HANDLE_ID_SET.has(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPositiveSize(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0;
}
