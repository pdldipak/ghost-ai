import {
  DEFAULT_NODE_COLOR,
  NODE_SHAPES,
  SHAPE_DEFAULT_SIZES,
  type CanvasNode,
  type NodeShape,
  type ShapeDragPayload,
} from "@/types/canvas";

let nodeIdCounter = 0;

export function createCanvasNodeId(shape: NodeShape): string {
  nodeIdCounter += 1;
  return `${shape}-${Date.now()}-${nodeIdCounter}`;
}

export function getShapeDragPayload(shape: NodeShape): ShapeDragPayload {
  const size = SHAPE_DEFAULT_SIZES[shape];
  return {
    shape,
    width: size.width,
    height: size.height,
  };
}

export function isNodeShape(value: unknown): value is NodeShape {
  return (
    typeof value === "string" &&
    (NODE_SHAPES as readonly string[]).includes(value)
  );
}

export function parseShapeDragPayload(raw: string): ShapeDragPayload | null {
  if (!raw) {
    return null;
  }

  try {
    const data: unknown = JSON.parse(raw);
    if (!isShapeDragPayload(data)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function createDroppedCanvasNode(
  payload: ShapeDragPayload,
  position: { x: number; y: number },
): CanvasNode {
  return {
    id: createCanvasNodeId(payload.shape),
    type: "canvasNode",
    position,
    width: payload.width,
    height: payload.height,
    data: {
      label: "",
      color: DEFAULT_NODE_COLOR,
      shape: payload.shape,
    },
  };
}

function isShapeDragPayload(value: unknown): value is ShapeDragPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    isNodeShape(candidate.shape) &&
    isPositiveSize(candidate.width) &&
    isPositiveSize(candidate.height)
  );
}

function isPositiveSize(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
