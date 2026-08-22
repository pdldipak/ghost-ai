"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OnEdgesChange, OnNodesChange } from "@xyflow/react";

import {
  canvasSnapshotKey,
  parseCanvasSnapshot,
  serializeCanvasSnapshot,
  type CanvasSnapshot,
} from "@/lib/canvas-snapshot";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export const CANVAS_AUTOSAVE_DEBOUNCE_MS = 1500;

export type CanvasSaveStatus = "idle" | "saving" | "saved" | "error";

interface CanvasGetResponse {
  nodes?: unknown;
  edges?: unknown;
  hasSnapshot?: unknown;
}

interface UseCanvasAutosaveOptions {
  projectId: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  onNodesChange: OnNodesChange<CanvasNode>;
  onEdgesChange: OnEdgesChange<CanvasEdge>;
  onFitView: (nodes: CanvasNode[]) => void;
}

interface UseCanvasAutosaveReturn {
  status: CanvasSaveStatus;
  saveNow: () => void;
}

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onFitView,
}: UseCanvasAutosaveOptions): UseCanvasAutosaveReturn {
  const [status, setStatus] = useState<CanvasSaveStatus>("idle");
  const [isReady, setIsReady] = useState(false);

  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const lastSavedKeyRef = useRef<string | null>(null);
  const pendingLoadKeyRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const isReadyRef = useRef(false);
  const applySnapshotRef = useRef<(snapshot: CanvasSnapshot) => void>(
    () => undefined,
  );
  const onFitViewRef = useRef(onFitView);

  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [edges, nodes]);

  const applySnapshot = useCallback(
    (snapshot: CanvasSnapshot) => {
      onEdgesChange(
        edgesRef.current.map((edge) => ({
          type: "remove" as const,
          id: edge.id,
        })),
      );
      onNodesChange([
        ...nodesRef.current.map((node) => ({
          type: "remove" as const,
          id: node.id,
        })),
        ...snapshot.nodes.map((node) => ({
          type: "add" as const,
          item: node,
        })),
      ]);
      onEdgesChange(
        snapshot.edges.map((edge) => ({
          type: "add" as const,
          item: edge,
        })),
      );
    },
    [onEdgesChange, onNodesChange],
  );

  useEffect(() => {
    applySnapshotRef.current = applySnapshot;
    onFitViewRef.current = onFitView;
  }, [applySnapshot, onFitView]);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const initial = serializeCanvasSnapshot(
        nodesRef.current,
        edgesRef.current,
      );

      if (initial.nodes.length > 0 || initial.edges.length > 0) {
        if (!cancelled) {
          isReadyRef.current = true;
          setIsReady(true);
        }
        return;
      }

      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`);
        if (!response.ok) {
          throw new Error("Failed to load canvas");
        }

        const payload = (await response.json()) as CanvasGetResponse;
        const snapshot = parseCanvasSnapshot({
          nodes: payload.nodes ?? [],
          edges: payload.edges ?? [],
        });

        if (cancelled) {
          return;
        }

        const hasSnapshot = payload.hasSnapshot === true;
        if (
          hasSnapshot &&
          snapshot &&
          (snapshot.nodes.length > 0 || snapshot.edges.length > 0)
        ) {
          pendingLoadKeyRef.current = canvasSnapshotKey(snapshot);
          lastSavedKeyRef.current = pendingLoadKeyRef.current;
          applySnapshotRef.current(snapshot);
          onFitViewRef.current(snapshot.nodes);
        } else {
          lastSavedKeyRef.current = canvasSnapshotKey(
            snapshot ?? { nodes: [], edges: [] },
          );
        }
      } catch {
        if (!cancelled) {
          lastSavedKeyRef.current = canvasSnapshotKey(initial);
          setStatus("error");
        }
      } finally {
        if (!cancelled) {
          isReadyRef.current = true;
          setIsReady(true);
        }
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const persist = useCallback(
    async (snapshot: CanvasSnapshot, force: boolean) => {
      const key = canvasSnapshotKey(snapshot);
      if (!force && key === lastSavedKeyRef.current) {
        return;
      }

      if (savingRef.current) {
        return;
      }

      savingRef.current = true;
      setStatus("saving");

      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(snapshot),
        });

        if (!response.ok) {
          throw new Error("Failed to save canvas");
        }

        lastSavedKeyRef.current = key;
        setStatus("saved");
      } catch {
        setStatus("error");
      } finally {
        savingRef.current = false;
      }
    },
    [projectId],
  );

  const saveNow = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    if (!isReadyRef.current) {
      return;
    }

    const snapshot = serializeCanvasSnapshot(
      nodesRef.current,
      edgesRef.current,
    );
    void persist(snapshot, true);
  }, [persist]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const snapshot = serializeCanvasSnapshot(nodes, edges);
    const key = canvasSnapshotKey(snapshot);

    if (pendingLoadKeyRef.current) {
      if (snapshot.nodes.length === 0 && snapshot.edges.length === 0) {
        return;
      }

      lastSavedKeyRef.current = key;
      pendingLoadKeyRef.current = null;
      return;
    }

    if (key === lastSavedKeyRef.current) {
      return;
    }

    setStatus((current) => (current === "saving" ? current : "idle"));

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      void persist(snapshot, false);
    }, CANVAS_AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [edges, isReady, nodes, persist]);

  return { status, saveNow };
}
