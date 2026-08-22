import {
  CANVAS_EDGE_MARKER,
  CANVAS_EDGE_STYLE,
} from "@/lib/canvas-edges";
import {
  NODE_COLORS,
  SHAPE_DEFAULT_SIZES,
  type CanvasEdge,
  type CanvasNode,
  type NodeColorFill,
  type NodeHandleId,
  type NodeShape,
} from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export interface TemplateBounds {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

const COLOR = {
  blue: NODE_COLORS[1].fill,
  purple: NODE_COLORS[2].fill,
  orange: NODE_COLORS[3].fill,
  red: NODE_COLORS[4].fill,
  pink: NODE_COLORS[5].fill,
  green: NODE_COLORS[6].fill,
  teal: NODE_COLORS[7].fill,
} as const satisfies Record<string, NodeColorFill>;

function templateNode(
  id: string,
  label: string,
  shape: NodeShape,
  color: NodeColorFill,
  x: number,
  y: number,
): CanvasNode {
  const size = SHAPE_DEFAULT_SIZES[shape];

  return {
    id,
    type: "canvasNode",
    position: { x, y },
    width: size.width,
    height: size.height,
    data: { label, color, shape },
  };
}

function templateEdge(
  source: string,
  target: string,
  label = "",
  sourceHandle: NodeHandleId = "right",
  targetHandle: NodeHandleId = "left",
): CanvasEdge {
  const id = label
    ? `e-${source}-${target}-${label}`
    : `e-${source}-${target}`;

  return {
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
    type: "canvasEdge",
    data: { label },
    style: CANVAS_EDGE_STYLE,
    markerEnd: CANVAS_EDGE_MARKER,
  };
}

export function getTemplateNodeSize(node: CanvasNode): {
  width: number;
  height: number;
} {
  return {
    width: node.width ?? SHAPE_DEFAULT_SIZES[node.data.shape].width,
    height: node.height ?? SHAPE_DEFAULT_SIZES[node.data.shape].height,
  };
}

export function getTemplateNodeCenter(node: CanvasNode): {
  x: number;
  y: number;
} {
  const { width, height } = getTemplateNodeSize(node);

  return {
    x: node.position.x + width / 2,
    y: node.position.y + height / 2,
  };
}

export function getTemplateBounds(nodes: CanvasNode[]): TemplateBounds {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    const { width, height } = getTemplateNodeSize(node);
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + width);
    maxY = Math.max(maxY, node.position.y + height);
  }

  if (!Number.isFinite(minX)) {
    return { minX: 0, minY: 0, width: 1, height: 1 };
  }

  return {
    minX,
    minY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
}

export function cloneCanvasTemplate(template: CanvasTemplate): {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
} {
  return {
    nodes: template.nodes.map((node) => ({
      ...node,
      position: { ...node.position },
      data: {
        label: node.data.label,
        color: node.data.color,
        shape: node.data.shape,
      },
    })),
    edges: template.edges.map((edge) => ({
      ...edge,
      data: { label: edge.data?.label ?? "" },
      style: edge.style ? { ...edge.style } : undefined,
    })),
  };
}

const MICROSERVICES: CanvasTemplate = {
  id: "microservices",
  name: "Microservices",
  description:
    "API gateway in front of independently deployable services, each with its own data store.",
  nodes: [
    templateNode("client", "Client", "pill", COLOR.blue, 0, 175),
    templateNode("gateway", "API Gateway", "hexagon", COLOR.teal, 260, 155),
    templateNode("auth", "Auth Service", "rectangle", COLOR.purple, 540, 0),
    templateNode("users", "User Service", "rectangle", COLOR.green, 540, 160),
    templateNode("orders", "Order Service", "rectangle", COLOR.orange, 540, 320),
    templateNode("auth-db", "Auth DB", "cylinder", COLOR.purple, 820, 0),
    templateNode("user-db", "User DB", "cylinder", COLOR.green, 820, 160),
    templateNode("order-db", "Order DB", "cylinder", COLOR.orange, 820, 320),
    templateNode("bus", "Message Bus", "diamond", COLOR.pink, 540, 480),
    templateNode("notify", "Notification", "rectangle", COLOR.red, 820, 490),
  ],
  edges: [
    templateEdge("client", "gateway"),
    templateEdge("gateway", "auth"),
    templateEdge("gateway", "users"),
    templateEdge("gateway", "orders"),
    templateEdge("auth", "auth-db"),
    templateEdge("users", "user-db"),
    templateEdge("orders", "order-db"),
    templateEdge("orders", "bus", "events", "bottom", "top"),
    templateEdge("bus", "notify"),
  ],
};

const CI_CD_PIPELINE: CanvasTemplate = {
  id: "ci-cd-pipeline",
  name: "CI/CD Pipeline",
  description:
    "Source control feeding a pipeline that builds, tests, and promotes artifacts to staging and production.",
  nodes: [
    templateNode("repo", "Repository", "rectangle", COLOR.blue, 0, 90),
    templateNode("ci", "CI Pipeline", "hexagon", COLOR.teal, 260, 80),
    templateNode("build", "Build", "rectangle", COLOR.orange, 540, 0),
    templateNode("test", "Test", "rectangle", COLOR.purple, 540, 180),
    templateNode("artifacts", "Artifacts", "cylinder", COLOR.orange, 820, 0),
    templateNode("staging", "Staging", "rectangle", COLOR.green, 820, 180),
    templateNode("prod", "Production", "cylinder", COLOR.red, 1100, 180),
  ],
  edges: [
    templateEdge("repo", "ci"),
    templateEdge("ci", "build"),
    templateEdge("ci", "test"),
    templateEdge("build", "artifacts"),
    templateEdge("test", "staging"),
    templateEdge("artifacts", "staging", "deploy", "bottom", "top"),
    templateEdge("staging", "prod"),
  ],
};

const EVENT_DRIVEN: CanvasTemplate = {
  id: "event-driven-system",
  name: "Event-driven System",
  description:
    "Producers publish domain events to a bus that fans out to consumers, with a dead-letter path for failures.",
  nodes: [
    templateNode("orders", "Order Service", "rectangle", COLOR.orange, 0, 40),
    templateNode("payments", "Payment Service", "rectangle", COLOR.red, 0, 220),
    templateNode("bus", "Event Bus", "hexagon", COLOR.teal, 320, 120),
    templateNode("inventory", "Inventory", "rectangle", COLOR.green, 640, 0),
    templateNode("notify", "Notifications", "rectangle", COLOR.purple, 640, 150),
    templateNode("analytics", "Analytics", "rectangle", COLOR.blue, 640, 300),
    templateNode("dlq", "Dead Letter Queue", "diamond", COLOR.pink, 320, 340),
  ],
  edges: [
    templateEdge("orders", "bus", "OrderPlaced"),
    templateEdge("payments", "bus", "PaymentCaptured"),
    templateEdge("bus", "inventory"),
    templateEdge("bus", "notify"),
    templateEdge("bus", "analytics"),
    templateEdge("bus", "dlq", "failed", "bottom", "top"),
  ],
};

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  MICROSERVICES,
  CI_CD_PIPELINE,
  EVENT_DRIVEN,
];
