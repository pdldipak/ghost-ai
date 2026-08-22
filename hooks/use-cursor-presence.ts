"use client";

import { useCallback, type PointerEvent } from "react";
import { useUpdateMyPresence } from "@liveblocks/react/suspense";
import { useReactFlow } from "@xyflow/react";

export function useCursorPresence() {
  const updateMyPresence = useUpdateMyPresence();
  const { screenToFlowPosition } = useReactFlow();

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      updateMyPresence({
        cursor: { x: position.x, y: position.y },
      });
    },
    [screenToFlowPosition, updateMyPresence],
  );

  const onPointerLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  return { onPointerMove, onPointerLeave };
}
