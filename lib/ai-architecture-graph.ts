import {
  validateAiCanvasPlan,
  type AddEdgeOperation,
  type AddNodeOperation,
  type AiCanvasOperation,
  type AiCanvasPlan,
  type CanvasSnapshot,
  type DeleteNodeOperation,
  type UpdateNodeDataOperation,
} from "@/lib/ai-canvas-plan";
import {
  DEFAULT_NODE_COLOR,
  NODE_COLORS,
  NODE_SHAPES,
  SHAPE_DEFAULT_SIZES,
  type NodeColorFill,
  type NodeShape,
} from "@/types/canvas";

export const ARCHITECTURE_KINDS = [
  "client",
  "gateway",
  "service",
  "api",
  "database",
  "cache",
  "queue",
  "integration",
  "infra",
] as const;

export type ArchitectureKind = (typeof ARCHITECTURE_KINDS)[number];

const ARCHITECTURE_TIERS = [
  "client",
  "gateway",
  "service",
  "queue",
  "data",
  "integration",
] as const;

type ArchitectureTier = (typeof ARCHITECTURE_TIERS)[number];

const KIND_TIER: Record<ArchitectureKind, ArchitectureTier> = {
  client: "client",
  gateway: "gateway",
  service: "service",
  api: "service",
  queue: "queue",
  database: "data",
  cache: "data",
  integration: "integration",
  infra: "integration",
};

const KIND_DEFAULTS: Record<
  ArchitectureKind,
  { shape: NodeShape; color: NodeColorFill }
> = {
  client: { shape: "pill", color: "#10233D" },
  gateway: { shape: "hexagon", color: "#2E1938" },
  service: { shape: "rectangle", color: "#062822" },
  api: { shape: "rectangle", color: "#10233D" },
  database: { shape: "cylinder", color: "#331B00" },
  cache: { shape: "cylinder", color: "#3C1618" },
  queue: { shape: "diamond", color: "#0F2E18" },
  integration: { shape: "rectangle", color: "#2E1938" },
  infra: { shape: "hexagon", color: "#1F1F1F" },
};

const TIER_X: Record<ArchitectureTier, number> = {
  client: 80,
  gateway: 340,
  service: 600,
  queue: 880,
  data: 1160,
  integration: 1440,
};

const NODE_GAP = 80;
const ROW_STRIDE = 140;
const ORIGIN_Y = 80;
const KIND_SET = new Set<string>(ARCHITECTURE_KINDS);
const SHAPE_SET = new Set<string>(NODE_SHAPES);
const COLOR_BY_LABEL = new Map(
  NODE_COLORS.map((color) => [color.label.toLowerCase(), color.fill]),
);
const COLOR_FILLS = new Set<string>(NODE_COLORS.map((color) => color.fill));

export interface ArchitectureGraphNode {
  id: string;
  label: string;
  kind: ArchitectureKind;
  shape: NodeShape;
  color: NodeColorFill;
}

export interface ArchitectureGraphEdge {
  source: string;
  target: string;
  label: string;
}

export interface ArchitectureGraph {
  replaceGraph: boolean;
  summary: string;
  nodes: ArchitectureGraphNode[];
  edges: ArchitectureGraphEdge[];
  removeNodeIds: string[];
}

interface NodeBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function slugId(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug.length > 0 ? slug : "component";
}

function uniqueId(base: string, used: Set<string>): string {
  let attempt = base;
  let counter = 1;

  while (used.has(attempt)) {
    counter += 1;
    attempt = `${base}-${counter}`;
  }

  used.add(attempt);
  return attempt;
}

function parseKind(value: unknown): ArchitectureKind | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return KIND_SET.has(normalized)
    ? (normalized as ArchitectureKind)
    : undefined;
}

function parseShape(value: unknown): NodeShape | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return SHAPE_SET.has(normalized) ? (normalized as NodeShape) : undefined;
}

function parseColor(value: unknown): NodeColorFill | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (COLOR_FILLS.has(trimmed)) {
    return trimmed as NodeColorFill;
  }

  return COLOR_BY_LABEL.get(trimmed.toLowerCase());
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

  let y = preferred.y;
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const next = { x: preferred.x, y, width, height };
    if (!boxes.some((box) => boxesOverlap(next, box, NODE_GAP / 2))) {
      return { x: preferred.x, y: Math.round(y) };
    }
    y += ROW_STRIDE;
  }

  const maxX = boxes.reduce(
    (max, box) => Math.max(max, box.x + box.width),
    TIER_X.client,
  );

  return {
    x: Math.round(maxX + NODE_GAP),
    y: Math.round(preferred.y),
  };
}

function existingBoxes(snapshot: CanvasSnapshot): NodeBox[] {
  return snapshot.nodes
    .map((node) => ({
      x: node.position.x,
      y: node.position.y,
      width: node.width ?? SHAPE_DEFAULT_SIZES[node.data.shape].width,
      height: node.height ?? SHAPE_DEFAULT_SIZES[node.data.shape].height,
    }))
    .filter(
      (box) =>
        Number.isFinite(box.x) &&
        Number.isFinite(box.y) &&
        Number.isFinite(box.width) &&
        Number.isFinite(box.height),
    );
}

export function parseArchitectureGraph(
  value: unknown,
  snapshot: CanvasSnapshot,
): ArchitectureGraph | string {
  const raw = asRecord(value);

  if (!raw) {
    return "Gemini returned an invalid architecture graph";
  }

  const nodesValue = raw.nodes;
  const edgesValue = raw.edges;

  if (!Array.isArray(nodesValue) || nodesValue.length === 0) {
    return "Architecture graph is missing nodes";
  }

  const replaceGraph =
    snapshot.nodes.length === 0 ? true : (asBoolean(raw.replaceGraph) ?? false);
  const snapshotIds = new Set(
    replaceGraph ? [] : snapshot.nodes.map((node) => node.id),
  );
  const usedIds = new Set<string>();
  const nodes: ArchitectureGraphNode[] = [];

  for (const item of nodesValue) {
    const record = asRecord(item);
    if (!record) {
      return "Gemini returned an invalid architecture node";
    }

    const label = asString(record.label)?.trim() ?? "";
    const kind = parseKind(record.kind) ?? "service";
    const defaults = KIND_DEFAULTS[kind];
    const requestedId = asString(record.id)?.trim() || slugId(label || kind);
    const id =
      snapshotIds.has(requestedId) && !usedIds.has(requestedId)
        ? requestedId
        : uniqueId(requestedId, usedIds);

    usedIds.add(id);

    nodes.push({
      id,
      label: label || kind,
      kind,
      shape: parseShape(record.shape) ?? defaults.shape,
      color: parseColor(record.color) ?? defaults.color ?? DEFAULT_NODE_COLOR,
    });
  }

  const knownIds = new Set([
    ...(replaceGraph ? [] : snapshot.nodes.map((node) => node.id)),
    ...nodes.map((node) => node.id),
  ]);
  const edges: ArchitectureGraphEdge[] = [];

  if (Array.isArray(edgesValue)) {
    for (const item of edgesValue) {
      const record = asRecord(item);
      if (!record) {
        continue;
      }

      const source = asString(record.source)?.trim() ?? "";
      const target = asString(record.target)?.trim() ?? "";

      if (!knownIds.has(source) || !knownIds.has(target) || source === target) {
        continue;
      }

      edges.push({
        source,
        target,
        label: asString(record.label)?.trim() ?? "",
      });
    }
  }

  const removeNodeIds = Array.isArray(raw.removeNodeIds)
    ? raw.removeNodeIds
        .map((id) => (typeof id === "string" ? id.trim() : ""))
        .filter((id) => id.length > 0 && snapshotIds.has(id))
    : [];

  return {
    replaceGraph,
    summary: asString(raw.summary)?.trim() ?? "",
    nodes,
    edges,
    removeNodeIds,
  };
}

export function architectureGraphToPlan(
  graph: ArchitectureGraph,
  snapshot: CanvasSnapshot,
): AiCanvasPlan | string {
  const boxes = graph.replaceGraph ? [] : existingBoxes(snapshot);
  const existingIds = new Set(
    graph.replaceGraph ? [] : snapshot.nodes.map((node) => node.id),
  );
  const operations: AiCanvasOperation[] = [];
  const nodesByTier = new Map<ArchitectureTier, ArchitectureGraphNode[]>();

  for (const node of graph.nodes) {
    const tier = KIND_TIER[node.kind];
    const current = nodesByTier.get(tier) ?? [];
    current.push(node);
    nodesByTier.set(tier, current);
  }

  for (const nodeId of graph.removeNodeIds) {
    if (existingIds.has(nodeId)) {
      const operation: DeleteNodeOperation = {
        type: "deleteNode",
        id: nodeId,
      };
      operations.push(operation);
      existingIds.delete(nodeId);
    }
  }

  for (const tier of ARCHITECTURE_TIERS) {
    const column = nodesByTier.get(tier) ?? [];

    column.forEach((node, row) => {
      if (existingIds.has(node.id)) {
        const operation: UpdateNodeDataOperation = {
          type: "updateNodeData",
          id: node.id,
          label: node.label,
          shape: node.shape,
          color: node.color,
        };
        operations.push(operation);
        return;
      }

      const size = SHAPE_DEFAULT_SIZES[node.shape];
      const position = findFreePosition(boxes, size.width, size.height, {
        x: TIER_X[tier],
        y: ORIGIN_Y + row * ROW_STRIDE,
      });
      boxes.push({ ...position, ...size });

      const operation: AddNodeOperation = {
        type: "addNode",
        id: node.id,
        label: node.label,
        shape: node.shape,
        color: node.color,
        x: Math.round(position.x),
        y: Math.round(position.y),
        width: size.width,
        height: size.height,
      };
      operations.push(operation);
    });
  }

  graph.edges.forEach((edge, index) => {
    const operation: AddEdgeOperation = {
      type: "addEdge",
      id: `e-${edge.source}-${edge.target}-${index}`,
      source: edge.source,
      target: edge.target,
      sourceHandle: "right",
      targetHandle: "left",
      label: edge.label,
    };
    operations.push(operation);
  });

  const plan: AiCanvasPlan = {
    replaceGraph: graph.replaceGraph,
    summary: graph.summary,
    operations,
  };

  return validateAiCanvasPlan(plan, snapshot) ?? plan;
}

export function extractJsonObject(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start < 0 || end <= start) {
    return null;
  }

  try {
    return JSON.parse(candidate.slice(start, end + 1)) as unknown;
  } catch {
    return null;
  }
}

export const AI_ARCHITECTURE_GRAPH_SCHEMA = {
  type: "object" as const,
  additionalProperties: false,
  required: ["replaceGraph", "summary", "nodes", "edges"],
  properties: {
    replaceGraph: {
      type: "boolean" as const,
      description:
        "True when the canvas is empty or the user asks to design, generate, replace, or start a new architecture.",
    },
    summary: {
      type: "string" as const,
      description:
        "One or two professional sentences describing the architecture that was placed on the canvas.",
    },
    nodes: {
      type: "array" as const,
      description:
        "Every architecture component as its own node. Include clients, gateways, services, APIs, databases, caches, queues, integrations, and infrastructure named or implied by the request. Do not return only a client.",
      items: {
        type: "object" as const,
        additionalProperties: false,
        required: ["id", "label", "kind"],
        properties: {
          id: {
            type: "string" as const,
            description: "Stable kebab-case id unique within this graph.",
          },
          label: {
            type: "string" as const,
            description: "Short canvas label, for example API Gateway.",
          },
          kind: {
            type: "string" as const,
            enum: [...ARCHITECTURE_KINDS],
          },
          shape: {
            type: "string" as const,
            enum: [...NODE_SHAPES],
          },
          color: { type: "string" as const },
        },
      },
    },
    edges: {
      type: "array" as const,
      description:
        "Directed connections between node ids: HTTP calls, events, reads, and writes.",
      items: {
        type: "object" as const,
        additionalProperties: false,
        required: ["source", "target"],
        properties: {
          source: { type: "string" as const },
          target: { type: "string" as const },
          label: { type: "string" as const },
        },
      },
    },
    removeNodeIds: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "Existing canvas node ids to delete during an incremental edit.",
    },
  },
};
