"use client";

import { useCallback } from "react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CanvasControlBar } from "@/components/editor/canvas-control-bar";
import { CanvasEdgeView } from "@/components/editor/canvas-edge";
import { CanvasNodeView } from "@/components/editor/canvas-node";
import { ShapePanel } from "@/components/editor/shape-panel";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import {
  cloneCanvasTemplate,
  type CanvasTemplate,
} from "@/components/editor/starter-templates";
import { CANVAS_ZOOM_DURATION_MS } from "@/hooks/use-keyboard-shortcuts";
import { useShapeDrop } from "@/hooks/use-shape-drop";
import {
  CANVAS_EDGE_STYLE,
  createCanvasEdge,
  DEFAULT_CANVAS_EDGE_OPTIONS,
} from "@/lib/canvas-edges";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

const nodeTypes = {
  canvasNode: CanvasNodeView,
};

const edgeTypes = {
  canvasEdge: CanvasEdgeView,
};

interface FlowCanvasInnerProps {
  templatesOpen: boolean;
  onTemplatesOpenChange: (open: boolean) => void;
}

function FlowCanvasInner({
  templatesOpen,
  onTemplatesOpenChange,
}: FlowCanvasInnerProps) {
  const reactFlow = useReactFlow();
  const { nodes, edges, onNodesChange, onEdgesChange, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  const { onDragOver, onDrop } = useShapeDrop(onNodesChange);

  const handleConnect = useCallback(
    (connection: Connection) => {
      const edge = createCanvasEdge(connection);
      if (!edge) {
        return;
      }

      onEdgesChange([{ type: "add", item: edge }]);
    },
    [onEdgesChange],
  );

  const handleImportTemplate = useCallback(
    (template: CanvasTemplate) => {
      const next = cloneCanvasTemplate(template);

      onEdgesChange(
        edges.map((edge) => ({ type: "remove" as const, id: edge.id })),
      );
      onNodesChange([
        ...nodes.map((node) => ({ type: "remove" as const, id: node.id })),
        ...next.nodes.map((node) => ({ type: "add" as const, item: node })),
      ]);
      onEdgesChange(
        next.edges.map((edge) => ({ type: "add" as const, item: edge })),
      );

      onTemplatesOpenChange(false);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          void reactFlow.fitView({
            nodes: next.nodes,
            duration: CANVAS_ZOOM_DURATION_MS,
            padding: 0.2,
          });
        });
      });
    },
    [
      edges,
      nodes,
      onEdgesChange,
      onNodesChange,
      onTemplatesOpenChange,
      reactFlow,
    ],
  );

  return (
    <div
      className="relative min-h-0 flex-1 bg-base"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onDelete={onDelete}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={DEFAULT_CANVAS_EDGE_OPTIONS}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={CANVAS_EDGE_STYLE}
        connectionMode={ConnectionMode.Loose}
        fitView
        proOptions={{ hideAttribution: true }}
        className="bg-base"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--border-subtle)"
        />
      </ReactFlow>
      <CanvasControlBar />
      <ShapePanel />
      <StarterTemplatesModal
        open={templatesOpen}
        onOpenChange={onTemplatesOpenChange}
        onImport={handleImportTemplate}
      />
    </div>
  );
}

interface FlowCanvasProps {
  templatesOpen: boolean;
  onTemplatesOpenChange: (open: boolean) => void;
}

export function FlowCanvas({
  templatesOpen,
  onTemplatesOpenChange,
}: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner
        templatesOpen={templatesOpen}
        onTemplatesOpenChange={onTemplatesOpenChange}
      />
    </ReactFlowProvider>
  );
}
