import { mutateFlow } from "@liveblocks/react-flow/node";

import type { CanvasSnapshot } from "@/lib/ai-canvas-plan";
import { liveblocks } from "@/lib/liveblocks";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export async function readCanvasSnapshot(
  roomId: string,
): Promise<CanvasSnapshot> {
  let snapshot: CanvasSnapshot = { nodes: [], edges: [] };

  await mutateFlow<CanvasNode, CanvasEdge>(
    { client: liveblocks, roomId },
    (flow) => {
      snapshot = {
        nodes: [...flow.nodes],
        edges: [...flow.edges],
      };
    },
  );

  return snapshot;
}
