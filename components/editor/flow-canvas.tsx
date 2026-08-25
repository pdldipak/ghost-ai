"use client";

import { useCallback, useEffect, useRef, type MutableRefObject } from "react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useStore,
  useStoreApi,
  type Connection,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { AiStatusFeed } from "@/components/editor/ai-status-feed";
import { CanvasControlBar } from "@/components/editor/canvas-control-bar";
import { CanvasEdgeView } from "@/components/editor/canvas-edge";
import { CanvasNodeView } from "@/components/editor/canvas-node";
import {
  EdgeLabelEditProvider,
  useEdgeLabelEdit,
} from "@/components/editor/edge-label-edit-context";
import { LiveCursors } from "@/components/editor/live-cursors";
import { PresenceAvatars } from "@/components/editor/presence-avatars";
import { ShapePanel } from "@/components/editor/shape-panel";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import {
  cloneCanvasTemplate,
  type CanvasTemplate,
} from "@/components/editor/starter-templates";
import {
  useCanvasAutosave,
  type CanvasSaveStatus,
} from "@/hooks/use-canvas-autosave";
import { useCursorPresence } from "@/hooks/use-cursor-presence";
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

const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1 } as const;

const FIT_VIEW_OPTIONS = {
  duration: CANVAS_ZOOM_DURATION_MS,
  padding: 0.2,
  includeHiddenNodes: true,
} as const;

const FIT_VIEW_SIZE_RETRIES = 32;

function selectFiniteViewport(state: { transform: [number, number, number] }): boolean {
  const [x, y, zoom] = state.transform;
  return Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(zoom) && zoom > 0;
}

function fitViewWhenPaneReady(
  fit: () => unknown,
  isPaneReady: () => boolean,
): void {
  const attempt = (remaining: number) => {
    if (isPaneReady()) {
      void fit();
      return;
    }

    if (remaining > 0) {
      requestAnimationFrame(() => attempt(remaining - 1));
    }
  };

  requestAnimationFrame(() => attempt(FIT_VIEW_SIZE_RETRIES));
}

interface FlowCanvasInnerProps {
  projectId: string;
  templatesOpen: boolean;
  onTemplatesOpenChange: (open: boolean) => void;
  onSaveStatusChange: (status: CanvasSaveStatus) => void;
  saveNowRef: MutableRefObject<(() => void) | null>;
}

function FlowCanvasInner({
  projectId,
  templatesOpen,
  onTemplatesOpenChange,
  onSaveStatusChange,
  saveNowRef,
}: FlowCanvasInnerProps) {
  const reactFlow = useReactFlow();
  const store = useStoreApi();
  const isViewportFinite = useStore(selectFiniteViewport);
  const { nodes, edges, onNodesChange, onEdgesChange, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });
  const startedEmptyRef = useRef(nodes.length === 0);

  const isPaneReady = useCallback(() => {
    const { width, height } = store.getState();
    return (
      Number.isFinite(width) &&
      Number.isFinite(height) &&
      width > 0 &&
      height > 0
    );
  }, [store]);

  const handleFitSavedView = useCallback(
    (savedNodes: CanvasNode[]) => {
      fitViewWhenPaneReady(
        () =>
          reactFlow.fitView({
            nodes: savedNodes,
            ...FIT_VIEW_OPTIONS,
          }),
        isPaneReady,
      );
    },
    [isPaneReady, reactFlow],
  );

  const handleInit = useCallback(
    (instance: ReactFlowInstance<CanvasNode, CanvasEdge>) => {
      if (startedEmptyRef.current) {
        return;
      }

      const currentNodes = instance.getNodes();
      if (currentNodes.length === 0) {
        return;
      }

      fitViewWhenPaneReady(
        () =>
          instance.fitView({
            nodes: currentNodes,
            ...FIT_VIEW_OPTIONS,
          }),
        isPaneReady,
      );
    },
    [isPaneReady],
  );

  useEffect(() => {
    if (isViewportFinite) {
      return;
    }

    void reactFlow.setViewport(DEFAULT_VIEWPORT, { duration: 0 });
  }, [isViewportFinite, reactFlow]);

  const { status, saveNow } = useCanvasAutosave({
    projectId,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onFitView: handleFitSavedView,
  });

  useEffect(() => {
    onSaveStatusChange(status);
  }, [onSaveStatusChange, status]);

  useEffect(() => {
    saveNowRef.current = saveNow;
    return () => {
      saveNowRef.current = null;
    };
  }, [saveNow, saveNowRef]);

  const { onDragOver, onDrop } = useShapeDrop(onNodesChange);
  const { onPointerMove, onPointerLeave } = useCursorPresence();
  const { beginEditing } = useEdgeLabelEdit();

  const handleConnect = useCallback(
    (connection: Connection) => {
      const edge = createCanvasEdge(connection);
      if (!edge) {
        return;
      }

      onEdgesChange([{ type: "add", item: edge }]);
      window.setTimeout(() => beginEditing(edge.id), 0);
    },
    [beginEditing, onEdgesChange],
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

      fitViewWhenPaneReady(
        () =>
          reactFlow.fitView({
            nodes: next.nodes,
            ...FIT_VIEW_OPTIONS,
          }),
        isPaneReady,
      );
    },
    [
      edges,
      isPaneReady,
      nodes,
      onEdgesChange,
      onNodesChange,
      onTemplatesOpenChange,
      reactFlow,
    ],
  );

  return (
    <div
      className="absolute inset-0 bg-base"
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
        onInit={handleInit}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={DEFAULT_CANVAS_EDGE_OPTIONS}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={CANVAS_EDGE_STYLE}
        connectionMode={ConnectionMode.Loose}
        defaultViewport={DEFAULT_VIEWPORT}
        proOptions={{ hideAttribution: true }}
        className="bg-base"
      >
        {isViewportFinite ? (
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="var(--border-subtle)"
          />
        ) : null}
        <LiveCursors />
      </ReactFlow>
      <AiStatusFeed />
      <PresenceAvatars />
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
  projectId: string;
  templatesOpen: boolean;
  onTemplatesOpenChange: (open: boolean) => void;
  onSaveStatusChange: (status: CanvasSaveStatus) => void;
  saveNowRef: MutableRefObject<(() => void) | null>;
}

export function FlowCanvas({
  projectId,
  templatesOpen,
  onTemplatesOpenChange,
  onSaveStatusChange,
  saveNowRef,
}: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <EdgeLabelEditProvider>
        <FlowCanvasInner
          projectId={projectId}
          templatesOpen={templatesOpen}
          onTemplatesOpenChange={onTemplatesOpenChange}
          onSaveStatusChange={onSaveStatusChange}
          saveNowRef={saveNowRef}
        />
      </EdgeLabelEditProvider>
    </ReactFlowProvider>
  );
}
