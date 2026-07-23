// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: Record<string, never>;
    // Example, real-time cursor coordinates
    // Presence: { cursor: { x: number; y: number } };

    // The Storage tree for the room, for useMutation, useStorage, etc.
    Storage: Record<string, never>;
    // Example, a conflict-free list
    // Storage: { animals: LiveList<string> };

    // Custom user info set when authenticating with a secret key
    UserMeta: {
      id: string;
      info: Record<string, never>;
      // Example properties, for useSelf, useUser, useOthers, etc.
      // info: { name: string; avatar: string };
    };

    // Custom events, for useBroadcastEvent, useEventListener
    RoomEvent: Record<string, never>;
    // Example has two events, using a union
    // RoomEvent: { type: "PLAY" } | { type: "REACTION"; emoji: "🔥" };

    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    ThreadMetadata: Record<string, never>;
    // Example, attaching coordinates to a thread
    // ThreadMetadata: { x: number; y: number };

    // Custom room info set with resolveRoomsInfo, for useRoomInfo
    RoomInfo: Record<string, never>;
    // Example, rooms with a title and url
    // RoomInfo: { title: string; url: string };
  }
}

export {};
