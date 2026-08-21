"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";

import { getShapeDragPayload } from "@/lib/canvas-nodes";
import { SHAPE_DRAG_MIME, type NodeShape, type ShapeDragPayload } from "@/types/canvas";

function hideNativeDragGhost(event: DragEvent) {
  const blank = document.createElement("div");
  blank.style.cssText =
    "position:fixed;top:-1px;left:-1px;width:1px;height:1px;opacity:0;pointer-events:none;";
  document.body.appendChild(blank);
  event.dataTransfer.setDragImage(blank, 0, 0);
  window.setTimeout(() => {
    blank.remove();
  }, 0);
}

export function useShapeDragPreview() {
  const [payload, setPayload] = useState<ShapeDragPayload | null>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);

  const movePreview = useCallback((x: number, y: number) => {
    if (x === 0 && y === 0) {
      return;
    }

    positionRef.current = { x, y };
    const node = previewRef.current;
    if (node) {
      node.style.transform = `translate(${x}px, ${y}px)`;
    }
  }, []);

  const onShapeDragStart = useCallback(
    (event: DragEvent<HTMLButtonElement>, shape: NodeShape) => {
      const nextPayload = getShapeDragPayload(shape);
      event.dataTransfer.setData(SHAPE_DRAG_MIME, JSON.stringify(nextPayload));
      event.dataTransfer.effectAllowed = "move";
      hideNativeDragGhost(event);
      positionRef.current = { x: event.clientX, y: event.clientY };
      setPayload(nextPayload);
    },
    [],
  );

  useEffect(() => {
    if (!payload) {
      return;
    }

    const node = previewRef.current;
    if (node) {
      const { x, y } = positionRef.current;
      node.style.transform = `translate(${x}px, ${y}px)`;
    }

    const onDragOver = (event: globalThis.DragEvent) => {
      movePreview(event.clientX, event.clientY);
    };

    const hidePreview = () => {
      setPayload(null);
    };

    window.addEventListener("dragover", onDragOver, true);
    window.addEventListener("dragend", hidePreview);
    window.addEventListener("drop", hidePreview);

    return () => {
      window.removeEventListener("dragover", onDragOver, true);
      window.removeEventListener("dragend", hidePreview);
      window.removeEventListener("drop", hidePreview);
    };
  }, [payload, movePreview]);

  return { payload, previewRef, onShapeDragStart };
}
