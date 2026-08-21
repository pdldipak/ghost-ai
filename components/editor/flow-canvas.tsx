"use client";

import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CanvasNodeView } from "@/components/editor/canvas-node";
import { ShapePanel } from "@/components/editor/shape-panel";
import { useShapeDrop } from "@/hooks/use-shape-drop";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

const nodeTypes = {
  canvasNode: CanvasNodeView,
};

function FlowCanvasInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  const { onDragOver, onDrop } = useShapeDrop(onNodesChange);

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
        onConnect={onConnect}
        onDelete={onDelete}
        nodeTypes={nodeTypes}
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
