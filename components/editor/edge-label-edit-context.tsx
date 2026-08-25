"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface EdgeLabelEditContextValue {
  editingEdgeId: string | null;
  beginEditing: (edgeId: string) => void;
  stopEditing: (edgeId?: string) => void;
}

const EdgeLabelEditContext = createContext<EdgeLabelEditContextValue | null>(
  null,
);

export function EdgeLabelEditProvider({ children }: { children: ReactNode }) {
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);

  const beginEditing = useCallback((edgeId: string) => {
    setEditingEdgeId(edgeId);
  }, []);

  const stopEditing = useCallback((edgeId?: string) => {
    setEditingEdgeId((current) => {
      if (edgeId && current !== edgeId) {
        return current;
      }

      return null;
    });
  }, []);

  const value = useMemo(
    () => ({ editingEdgeId, beginEditing, stopEditing }),
    [beginEditing, editingEdgeId, stopEditing],
  );

  return (
    <EdgeLabelEditContext.Provider value={value}>
      {children}
    </EdgeLabelEditContext.Provider>
  );
}

export function useEdgeLabelEdit(): EdgeLabelEditContextValue {
  const value = useContext(EdgeLabelEditContext);

  if (!value) {
    throw new Error("useEdgeLabelEdit must be used within EdgeLabelEditProvider");
  }

  return value;
}
