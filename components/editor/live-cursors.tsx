"use client";

import { useAuth } from "@clerk/nextjs";
import { shallow, useOther, useOthersConnectionIds } from "@liveblocks/react/suspense";
import { useViewport, ViewportPortal } from "@xyflow/react";

const FALLBACK_NAME = "Guest";

interface LiveCursorProps {
  connectionId: number;
  currentUserId: string | null | undefined;
}

function LiveCursor({ connectionId, currentUserId }: LiveCursorProps) {
  const { zoom } = useViewport();
  const other = useOther(
    connectionId,
    (user) => ({
      id: user.id,
      cursor: user.presence.cursor,
      name: user.info.name,
      color: user.info.color,
    }),
    shallow,
  );

  if (!other.cursor || (currentUserId && other.id === currentUserId)) {
    return null;
  }

  const name = other.name.trim() || FALLBACK_NAME;
  const scale = zoom === 0 ? 1 : 1 / zoom;

  return (
    <div
      className="pointer-events-none absolute top-0 left-0 z-50"
      style={{
        transform: `translate(${other.cursor.x}px, ${other.cursor.y}px) scale(${scale})`,
        transformOrigin: "0 0",
      }}
    >
      <svg
        width="16"
        height="20"
        viewBox="0 0 16 20"
        fill="none"
        aria-hidden
      >
        <path
          d="M1.5 1.5 14.5 9.2 8.6 10.6 11.8 18.2 9.4 19.2 6.1 11.4 1.5 15.5V1.5Z"
          fill={other.color}
          stroke="var(--bg-base)"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="absolute top-4 left-3 max-w-32 truncate rounded-xl px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap"
        style={{
          backgroundColor: other.color,
          color: "var(--bg-base)",
        }}
      >
        {name}
      </span>
    </div>
  );
}

export function LiveCursors() {
  const { userId } = useAuth();
  const connectionIds = useOthersConnectionIds();

  return (
    <ViewportPortal>
      {connectionIds.map((connectionId) => (
        <LiveCursor
          key={connectionId}
          connectionId={connectionId}
          currentUserId={userId}
        />
      ))}
    </ViewportPortal>
  );
}
