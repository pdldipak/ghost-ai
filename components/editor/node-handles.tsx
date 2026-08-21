"use client";

import { Handle, Position, useConnection } from "@xyflow/react";

import { cn } from "@/lib/utils";
import { NODE_HANDLE_IDS, type NodeHandleId } from "@/types/canvas";

const HANDLE_POSITIONS: Record<NodeHandleId, Position> = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
};

export function NodeHandles() {
  const connection = useConnection();
  const showHandles = connection.inProgress;

  return (
    <>
      {NODE_HANDLE_IDS.map((id) => (
        <Handle
          key={id}
          id={id}
          type="source"
          position={HANDLE_POSITIONS[id]}
          isConnectableStart
          isConnectableEnd
          className={cn(
            "!z-30 !size-2 !rounded-full !border !border-base !bg-copy",
            "opacity-0 transition-opacity duration-150",
            "group-hover:opacity-100",
            showHandles && "opacity-100",
          )}
        />
      ))}
    </>
  );
}
