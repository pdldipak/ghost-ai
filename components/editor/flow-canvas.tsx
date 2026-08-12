"use client";

import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export function FlowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  return (
    <div className="relative min-h-0 flex-1 bg-base">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
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
    </div>
  );
}
