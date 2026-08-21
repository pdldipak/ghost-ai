"use client";

import { useCallback, type DragEvent } from "react";
import { useReactFlow, type OnNodesChange } from "@xyflow/react";

import {
  createDroppedCanvasNode,
  parseShapeDragPayload,
} from "@/lib/canvas-nodes";
import { SHAPE_DRAG_MIME, type CanvasNode } from "@/types/canvas";

export function useShapeDrop(onNodesChange: OnNodesChange<CanvasNode>) {
  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const payload = parseShapeDragPayload(
        event.dataTransfer.getData(SHAPE_DRAG_MIME),
      );
      if (!payload) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      onNodesChange([
        {
          type: "add",
          item: createDroppedCanvasNode(payload, position),
        },
      ]);
    },
    [onNodesChange, screenToFlowPosition],
  );

  return { onDragOver, onDrop };
}
