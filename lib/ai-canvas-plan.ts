import type { MutableFlow } from "@liveblocks/react-flow/node";

import {
  CANVAS_EDGE_MARKER,
  CANVAS_EDGE_STYLE,
} from "@/lib/canvas-edges";
import { isFinitePosition } from "@/lib/canvas-nodes";
import {
  DEFAULT_NODE_COLOR,
  NODE_COLORS,
  NODE_HANDLE_IDS,
  NODE_MIN_HEIGHT,
  NODE_MIN_WIDTH,
  NODE_SHAPES,
  SHAPE_DEFAULT_SIZES,
  type CanvasEdge,
  type CanvasNode,
  type NodeColorFill,
  type NodeHandleId,
  type NodeShape,
} from "@/types/canvas";

const NODE_GAP = 80;
const LAYOUT_ORIGIN = { x: 80, y: 80 };

export type AiCanvasOperationType =
  | "addNode"
  | "moveNode"
  | "resizeNode"
  | "updateNodeData"
  | "deleteNode"
  | "addEdge"
  | "deleteEdge";

export interface AddNodeOperation {
  type: "addNode";
  id: string;
  label: string;
  shape: NodeShape;
  color: NodeColorFill;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MoveNodeOperation {
  type: "moveNode";
  id: string;
  x: number;
  y: number;
}

export interface ResizeNodeOperation {
  type: "resizeNode";
  id: string;
  width: number;
  height: number;
}

export interface UpdateNodeDataOperation {
  type: "updateNodeData";
  id: string;
  label?: string;
  color?: NodeColorFill;
  shape?: NodeShape;
}

export interface DeleteNodeOperation {
  type: "deleteNode";
  id: string;
}

export interface AddEdgeOperation {
  type: "addEdge";
  id: string;
  source: string;
  target: string;
  sourceHandle: NodeHandleId;
  targetHandle: NodeHandleId;
  label: string;
}

export interface DeleteEdgeOperation {
  type: "deleteEdge";
  id: string;
}

export type AiCanvasOperation =
  | AddNodeOperation
  | MoveNodeOperation
  | ResizeNodeOperation
  | UpdateNodeDataOperation
  | DeleteNodeOperation
  | AddEdgeOperation
  | DeleteEdgeOperation;

export interface AiCanvasPlan {
  replaceGraph: boolean;
  summary: string;
  operations: AiCanvasOperation[];
}

export interface CanvasSnapshot {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

interface NodeBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const NODE_COLOR_BY_LABEL = new Map(
  NODE_COLORS.map((color) => [color.label.toLowerCase(), color.fill]),
);
const NODE_COLOR_FILLS = new Set<string>(NODE_COLORS.map((color) => color.fill));
const NODE_SHAPE_SET = new Set<string>(NODE_SHAPES);
const NODE_HANDLE_SET = new Set<string>(NODE_HANDLE_IDS);

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function clampSize(width: number, height: number): { width: number; height: number } {
  return {
    width: Math.max(NODE_MIN_WIDTH, Math.round(width)),
    height: Math.max(NODE_MIN_HEIGHT, Math.round(height)),
  };
}

function parseShape(value: unknown): NodeShape | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return NODE_SHAPE_SET.has(normalized) ? (normalized as NodeShape) : undefined;
}

function parseColor(value: unknown): NodeColorFill | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (NODE_COLOR_FILLS.has(trimmed)) {
    return trimmed as NodeColorFill;
  }

  const byLabel = NODE_COLOR_BY_LABEL.get(trimmed.toLowerCase());
  if (byLabel) {
    return byLabel;
  }

  if (trimmed.toLowerCase() === "default" || trimmed.toLowerCase() === "neutral") {
    return DEFAULT_NODE_COLOR;
  }

  return undefined;
}

function parseHandle(value: unknown, fallback: NodeHandleId): NodeHandleId {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  return NODE_HANDLE_SET.has(normalized) ? (normalized as NodeHandleId) : fallback;
}

function nodeSize(node: CanvasNode): { width: number; height: number } {
  return {
    width: node.width ?? SHAPE_DEFAULT_SIZES[node.data.shape].width,
    height: node.height ?? SHAPE_DEFAULT_SIZES[node.data.shape].height,
  };
}

function boxesOverlap(a: NodeBox, b: NodeBox, gap: number): boolean {
  return (
    a.x < b.x + b.width + gap &&
    a.x + a.width + gap > b.x &&
    a.y < b.y + b.height + gap &&
    a.y + a.height + gap > b.y
  );
}

function findFreePosition(
  boxes: NodeBox[],
  width: number,
  height: number,
  preferred: { x: number; y: number },
): { x: number; y: number } {
  const candidate = { x: preferred.x, y: preferred.y, width, height };

  if (!boxes.some((box) => boxesOverlap(candidate, box, NODE_GAP / 2))) {
    return preferred;
  }

  const maxX = boxes.reduce(
    (max, box) => Math.max(max, box.x + box.width),
    LAYOUT_ORIGIN.x,
  );

  return {
    x: Math.round(maxX + NODE_GAP),
    y: Math.round(preferred.y),
  };
}

function nextPlacement(
  boxes: NodeBox[],
  width: number,
  height: number,
  index: number,
): { x: number; y: number } {
  const column = index % 3;
  const row = Math.floor(index / 3);
  const preferred = {
    x: LAYOUT_ORIGIN.x + column * (width + NODE_GAP),
    y: LAYOUT_ORIGIN.y + row * (height + NODE_GAP),
  };

  return findFreePosition(boxes, width, height, preferred);
}

function uniqueId(prefix: string, used: Set<string>): string {
  let attempt = `${prefix}-${Date.now().toString(36)}`;
  let counter = 0;

  while (used.has(attempt)) {
    counter += 1;
    attempt = `${prefix}-${Date.now().toString(36)}-${counter}`;
  }

  used.add(attempt);
  return attempt;
}

function parseAddNode(
  raw: Record<string, unknown>,
  usedIds: Set<string>,
  boxes: NodeBox[],
  index: number,
): AddNodeOperation | string {
  const shape = parseShape(raw.shape) ?? "rectangle";
  const defaults = SHAPE_DEFAULT_SIZES[shape];
  const size = clampSize(
    asNumber(raw.width) ?? defaults.width,
    asNumber(raw.height) ?? defaults.height,
  );
  const requestedId = asString(raw.id)?.trim();
  const id =
    requestedId && !usedIds.has(requestedId)
      ? requestedId
      : uniqueId(`ai-${shape}`, usedIds);
  usedIds.add(id);

  const preferred = {
    x: asNumber(raw.x) ?? nextPlacement(boxes, size.width, size.height, index).x,
    y: asNumber(raw.y) ?? nextPlacement(boxes, size.width, size.height, index).y,
  };
  const position = findFreePosition(boxes, size.width, size.height, preferred);
  boxes.push({ ...position, ...size });

  return {
    type: "addNode",
    id,
    label: asString(raw.label)?.trim() ?? "",
    shape,
    color: parseColor(raw.color) ?? DEFAULT_NODE_COLOR,
    x: Math.round(position.x),
    y: Math.round(position.y),
    width: size.width,
    height: size.height,
  };
}

function parseMoveNode(raw: Record<string, unknown>): MoveNodeOperation | string {
  const id = asString(raw.id)?.trim();
  const x = asNumber(raw.x);
  const y = asNumber(raw.y);

  if (!id) {
    return "moveNode requires id";
  }

  if (x === undefined || y === undefined) {
    return `moveNode ${id} requires x and y`;
  }

  return { type: "moveNode", id, x: Math.round(x), y: Math.round(y) };
}

function parseResizeNode(raw: Record<string, unknown>): ResizeNodeOperation | string {
  const id = asString(raw.id)?.trim();
  const width = asNumber(raw.width);
  const height = asNumber(raw.height);

  if (!id) {
    return "resizeNode requires id";
  }

  if (width === undefined || height === undefined) {
    return `resizeNode ${id} requires width and height`;
  }

  const size = clampSize(width, height);
  return { type: "resizeNode", id, width: size.width, height: size.height };
}

function parseUpdateNodeData(
  raw: Record<string, unknown>,
): UpdateNodeDataOperation | string {
  const id = asString(raw.id)?.trim();

  if (!id) {
    return "updateNodeData requires id";
  }

  const operation: UpdateNodeDataOperation = { type: "updateNodeData", id };
  const label = asString(raw.label);
  const color = raw.color === undefined ? undefined : parseColor(raw.color);
  const shape = raw.shape === undefined ? undefined : parseShape(raw.shape);

  if (raw.color !== undefined && color === undefined) {
    return `updateNodeData ${id} has an invalid color`;
  }

  if (raw.shape !== undefined && shape === undefined) {
    return `updateNodeData ${id} has an invalid shape`;
  }

  if (label !== undefined) {
    operation.label = label;
  }

  if (color) {
    operation.color = color;
  }

  if (shape) {
    operation.shape = shape;
  }

  if (
    operation.label === undefined &&
    operation.color === undefined &&
    operation.shape === undefined
  ) {
    return `updateNodeData ${id} must change label, color, or shape`;
  }

  return operation;
}

function parseDeleteNode(raw: Record<string, unknown>): DeleteNodeOperation | string {
  const id = asString(raw.id)?.trim();
  return id ? { type: "deleteNode", id } : "deleteNode requires id";
}

function parseAddEdge(
  raw: Record<string, unknown>,
  usedIds: Set<string>,
): AddEdgeOperation | string {
  const source = asString(raw.source)?.trim();
  const target = asString(raw.target)?.trim();

  if (!source || !target) {
    return "addEdge requires source and target";
  }

  const requestedId = asString(raw.id)?.trim();
  const id =
    requestedId && !usedIds.has(requestedId)
      ? requestedId
      : uniqueId(`e-${source}-${target}`, usedIds);
  usedIds.add(id);

  return {
    type: "addEdge",
    id,
    source,
    target,
    sourceHandle: parseHandle(raw.sourceHandle, "right"),
    targetHandle: parseHandle(raw.targetHandle, "left"),
    label: asString(raw.label)?.trim() ?? "",
  };
}

function parseDeleteEdge(raw: Record<string, unknown>): DeleteEdgeOperation | string {
  const id = asString(raw.id)?.trim();
  return id ? { type: "deleteEdge", id } : "deleteEdge requires id";
}

export function parseAiCanvasPlan(
  value: unknown,
  snapshot: CanvasSnapshot,
): AiCanvasPlan | string {
  const raw = asRecord(value);

  if (!raw) {
    return "Gemini returned an invalid plan";
  }

  const replaceGraph = asBoolean(raw.replaceGraph) ?? false;
  const operationsValue = raw.operations;

  if (!Array.isArray(operationsValue)) {
    return "Gemini plan is missing operations";
  }

  const usedNodeIds = new Set(
    replaceGraph ? [] : snapshot.nodes.map((node) => node.id),
  );
  const usedEdgeIds = new Set(
    replaceGraph ? [] : snapshot.edges.map((edge) => edge.id),
  );
  const boxes: NodeBox[] = (replaceGraph ? [] : snapshot.nodes)
    .map((node) => {
      const size = nodeSize(node);
      return {
        x: node.position.x,
        y: node.position.y,
        width: size.width,
        height: size.height,
      };
    })
    .filter(
      (box) =>
        Number.isFinite(box.x) &&
        Number.isFinite(box.y) &&
        Number.isFinite(box.width) &&
        Number.isFinite(box.height),
    );

  const operations: AiCanvasOperation[] = [];
  let addedNodeCount = 0;

  for (const item of operationsValue) {
    const operation = asRecord(item);

    if (!operation) {
      return "Gemini returned an invalid operation";
    }

    const type = asString(operation.type);

    switch (type) {
      case "addNode": {
        const parsed = parseAddNode(operation, usedNodeIds, boxes, addedNodeCount);
        if (typeof parsed === "string") {
          return parsed;
        }
        addedNodeCount += 1;
        operations.push(parsed);
        break;
      }
      case "moveNode": {
        const parsed = parseMoveNode(operation);
        if (typeof parsed === "string") {
          return parsed;
        }
        operations.push(parsed);
        break;
      }
      case "resizeNode": {
        const parsed = parseResizeNode(operation);
        if (typeof parsed === "string") {
          return parsed;
        }
        operations.push(parsed);
        break;
      }
      case "updateNodeData": {
        const parsed = parseUpdateNodeData(operation);
        if (typeof parsed === "string") {
          return parsed;
        }
        operations.push(parsed);
        break;
      }
      case "deleteNode": {
        const parsed = parseDeleteNode(operation);
        if (typeof parsed === "string") {
          return parsed;
        }
        usedNodeIds.delete(parsed.id);
        operations.push(parsed);
        break;
      }
      case "addEdge": {
        const parsed = parseAddEdge(operation, usedEdgeIds);
        if (typeof parsed === "string") {
          return parsed;
        }
        operations.push(parsed);
        break;
      }
      case "deleteEdge": {
        const parsed = parseDeleteEdge(operation);
        if (typeof parsed === "string") {
          return parsed;
        }
        usedEdgeIds.delete(parsed.id);
        operations.push(parsed);
        break;
      }
      default:
        return `Unsupported operation type: ${type ?? "unknown"}`;
    }
  }

  return {
    replaceGraph,
    summary: asString(raw.summary)?.trim() ?? "",
    operations,
  };
}

export function validateAiCanvasPlan(
  plan: AiCanvasPlan,
  snapshot: CanvasSnapshot,
): string | null {
  const nodes = new Map(
    (plan.replaceGraph ? [] : snapshot.nodes).map((node) => [node.id, node]),
  );
  const edges = new Map(
    (plan.replaceGraph ? [] : snapshot.edges).map((edge) => [edge.id, edge]),
  );

  for (const operation of plan.operations) {
    switch (operation.type) {
      case "addNode":
        if (
          !isFinitePosition({ x: operation.x, y: operation.y }) ||
          !isPositiveFiniteSize(operation.width, operation.height)
        ) {
          return `Cannot add node ${operation.id} with invalid position or size`;
        }
        nodes.set(operation.id, {
          id: operation.id,
          type: "canvasNode",
          position: { x: operation.x, y: operation.y },
          width: operation.width,
          height: operation.height,
          data: {
            label: operation.label,
            color: operation.color,
            shape: operation.shape,
          },
        });
        break;
      case "moveNode":
        if (!nodes.has(operation.id)) {
          return `Cannot moveNode missing node ${operation.id}`;
        }
        if (!isFinitePosition({ x: operation.x, y: operation.y })) {
          return `Cannot move node ${operation.id} to an invalid position`;
        }
        break;
      case "resizeNode":
        if (!nodes.has(operation.id)) {
          return `Cannot resizeNode missing node ${operation.id}`;
        }
        if (!isPositiveFiniteSize(operation.width, operation.height)) {
          return `Cannot resize node ${operation.id} to an invalid size`;
        }
        break;
      case "updateNodeData":
        if (!nodes.has(operation.id)) {
          return `Cannot updateNodeData missing node ${operation.id}`;
        }
        break;
      case "deleteNode":
        if (!nodes.has(operation.id)) {
          return `Cannot delete missing node ${operation.id}`;
        }
        nodes.delete(operation.id);
        for (const [edgeId, edge] of edges) {
          if (edge.source === operation.id || edge.target === operation.id) {
            edges.delete(edgeId);
          }
        }
        break;
      case "addEdge":
        if (!nodes.has(operation.source) || !nodes.has(operation.target)) {
          return `Cannot add edge ${operation.id} without both nodes`;
        }
        edges.set(operation.id, {
          id: operation.id,
          source: operation.source,
          target: operation.target,
          sourceHandle: operation.sourceHandle,
          targetHandle: operation.targetHandle,
          type: "canvasEdge",
          data: { label: operation.label },
        });
        break;
      case "deleteEdge":
        if (!edges.has(operation.id)) {
          return `Cannot delete missing edge ${operation.id}`;
        }
        edges.delete(operation.id);
        break;
    }
  }

  return null;
}

export function nodeCursorPosition(node: CanvasNode): { x: number; y: number } {
  const size = nodeSize(node);
  return {
    x: node.position.x + size.width / 2,
    y: node.position.y + size.height / 2,
  };
}

function isPositiveFiniteSize(width: number, height: number): boolean {
  return Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0;
}

async function reportCursor(
  onCursor: (cursor: { x: number; y: number }) => Promise<void>,
  node: CanvasNode | undefined,
): Promise<void> {
  if (!node || !isFinitePosition(node.position)) {
    return;
  }

  const cursor = nodeCursorPosition(node);
  if (!isFinitePosition(cursor)) {
    return;
  }

  await onCursor(cursor);
}

export function serializeCanvasForPrompt(snapshot: CanvasSnapshot): string {
  return JSON.stringify(
    {
      nodes: snapshot.nodes.map((node) => ({
        id: node.id,
        position: node.position,
        width: node.width ?? SHAPE_DEFAULT_SIZES[node.data.shape].width,
        height: node.height ?? SHAPE_DEFAULT_SIZES[node.data.shape].height,
        data: node.data,
      })),
      edges: snapshot.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        label: edge.data?.label ?? "",
      })),
    },
    null,
    2,
  );
}

function toCanvasNode(operation: AddNodeOperation): CanvasNode {
  return {
    id: operation.id,
    type: "canvasNode",
    position: { x: operation.x, y: operation.y },
    width: operation.width,
    height: operation.height,
    data: {
      label: operation.label,
      color: operation.color,
      shape: operation.shape,
    },
  };
}

function toCanvasEdge(operation: AddEdgeOperation): CanvasEdge {
  return {
    id: operation.id,
    source: operation.source,
    target: operation.target,
    sourceHandle: operation.sourceHandle,
    targetHandle: operation.targetHandle,
    type: "canvasEdge",
    data: { label: operation.label },
    style: CANVAS_EDGE_STYLE,
    markerEnd: CANVAS_EDGE_MARKER,
  };
}

export async function applyAiCanvasPlan(
  flow: MutableFlow<CanvasNode, CanvasEdge>,
  plan: AiCanvasPlan,
  onCursor: (cursor: { x: number; y: number }) => Promise<void>,
): Promise<void> {
  if (plan.replaceGraph) {
    if (flow.edges.length > 0) {
      flow.removeEdges(flow.edges.map((edge) => edge.id));
    }

    if (flow.nodes.length > 0) {
      flow.removeNodes(flow.nodes.map((node) => node.id));
    }
  }

  for (const operation of plan.operations) {
    switch (operation.type) {
      case "addNode": {
        const node = toCanvasNode(operation);
        if (
          !isFinitePosition(node.position) ||
          !isPositiveFiniteSize(node.width ?? 0, node.height ?? 0)
        ) {
          break;
        }
        flow.addNode(node);
        await reportCursor(onCursor, node);
        break;
      }
      case "moveNode": {
        if (!isFinitePosition({ x: operation.x, y: operation.y })) {
          break;
        }
        flow.updateNode(operation.id, {
          position: { x: operation.x, y: operation.y },
        });
        await reportCursor(onCursor, flow.getNode(operation.id));
        break;
      }
      case "resizeNode": {
        if (!isPositiveFiniteSize(operation.width, operation.height)) {
          break;
        }
        flow.updateNode(operation.id, {
          width: operation.width,
          height: operation.height,
        });
        await reportCursor(onCursor, flow.getNode(operation.id));
        break;
      }
      case "updateNodeData": {
        const current = flow.getNode(operation.id);
        if (!current) {
          break;
        }

        const nextShape = operation.shape ?? current.data.shape;
        const nextSize =
          operation.shape && operation.shape !== current.data.shape
            ? SHAPE_DEFAULT_SIZES[nextShape]
            : nodeSize(current);

        flow.updateNode(operation.id, {
          width: nextSize.width,
          height: nextSize.height,
        });
        flow.updateNodeData(operation.id, {
          label: operation.label ?? current.data.label,
          color: operation.color ?? current.data.color,
          shape: nextShape,
        });
        await reportCursor(onCursor, {
          ...current,
          width: nextSize.width,
          height: nextSize.height,
          data: {
            ...current.data,
            shape: nextShape,
          },
        });
        break;
      }
      case "deleteNode": {
        await reportCursor(onCursor, flow.getNode(operation.id));

        const connected = flow.edges
          .filter(
            (edge) =>
              edge.source === operation.id || edge.target === operation.id,
          )
          .map((edge) => edge.id);

        if (connected.length > 0) {
          flow.removeEdges(connected);
        }

        flow.removeNode(operation.id);
        break;
      }
      case "addEdge": {
        flow.addEdge(toCanvasEdge(operation));
        await reportCursor(onCursor, flow.getNode(operation.source));
        break;
      }
      case "deleteEdge": {
        const edge = flow.getEdge(operation.id);
        await reportCursor(
          onCursor,
          edge ? flow.getNode(edge.source) : undefined,
        );
        flow.removeEdge(operation.id);
        break;
      }
    }
  }
}

export const AI_CANVAS_PLAN_SCHEMA = {
  type: "object" as const,
  additionalProperties: false,
  required: ["replaceGraph", "summary", "operations"],
  properties: {
    replaceGraph: {
      type: "boolean" as const,
      description:
        "True only when the user clearly asks to replace the whole design or generate a new architecture from scratch.",
    },
    summary: {
      type: "string" as const,
      description: "Short description of the planned canvas changes.",
    },
    operations: {
      type: "array" as const,
      items: {
        type: "object" as const,
        required: ["type"],
        properties: {
          type: {
            type: "string" as const,
            enum: [
              "addNode",
              "moveNode",
              "resizeNode",
              "updateNodeData",
              "deleteNode",
              "addEdge",
              "deleteEdge",
            ],
          },
          id: { type: "string" as const },
          label: { type: "string" as const },
          shape: { type: "string" as const, enum: [...NODE_SHAPES] },
          color: { type: "string" as const },
          x: { type: "number" as const },
          y: { type: "number" as const },
          width: { type: "number" as const },
          height: { type: "number" as const },
          source: { type: "string" as const },
          target: { type: "string" as const },
          sourceHandle: {
            type: "string" as const,
            enum: [...NODE_HANDLE_IDS],
          },
          targetHandle: {
            type: "string" as const,
            enum: [...NODE_HANDLE_IDS],
          },
        },
      },
    },
  },
};
