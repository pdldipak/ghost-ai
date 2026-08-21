"use client";

import { useCallback } from "react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CanvasEdgeView } from "@/components/editor/canvas-edge";
import { CanvasNodeView } from "@/components/editor/canvas-node";
import { ShapePanel } from "@/components/editor/shape-panel";
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

function FlowCanvasInner() {
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
        <MiniMap
          pannable
          zoomable
          className="!rounded-xl !border !border-surface-border !bg-surface"
          maskColor="rgba(8, 8, 9, 0.7)"
          nodeColor="var(--accent-primary)"
        />
      </ReactFlow>
      <ShapePanel />
    </div>
  );
}

export function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
}
