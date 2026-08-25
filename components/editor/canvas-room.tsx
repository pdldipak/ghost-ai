"use client";

import type { ReactNode } from "react";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import { ErrorBoundary } from "react-error-boundary";

function CanvasLoading() {
  return (
    <div className="flex h-full items-center justify-center bg-base">
      <p className="text-sm text-copy-muted">Loading canvas…</p>
    </div>
  );
}

function CanvasConnectionError() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 bg-base px-4 text-center">
      <p className="text-sm font-medium text-copy">Unable to connect to the canvas</p>
      <p className="text-sm text-copy-muted">
        Check your connection and refresh the page to try again.
      </p>
    </div>
  );
}

interface CanvasRoomProps {
  roomId: string;
  children: ReactNode;
}

export function CanvasRoom({ roomId, children }: CanvasRoomProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, isThinking: false }}
      >
        <div className="relative min-h-0 flex-1">
          <ErrorBoundary fallback={<CanvasConnectionError />}>
            <ClientSideSuspense fallback={<CanvasLoading />}>
              {children}
            </ClientSideSuspense>
          </ErrorBoundary>
        </div>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
