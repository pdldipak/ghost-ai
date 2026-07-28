import { Liveblocks } from "@liveblocks/node";

const CURSOR_COLORS = [
  "#52A8FF",
  "#BF7AF0",
  "#FF990A",
  "#FF6166",
  "#F75F8F",
  "#34D399",
  "#0AC7B4",
  "#EDEDED",
] as const;

const globalForLiveblocks = globalThis as unknown as {
  liveblocks: Liveblocks | undefined;
};

function createLiveblocksClient(): Liveblocks {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not set");
  }

  return new Liveblocks({ secret });
}

function getLiveblocksClient(): Liveblocks {
  if (!globalForLiveblocks.liveblocks) {
    globalForLiveblocks.liveblocks = createLiveblocksClient();
  }

  return globalForLiveblocks.liveblocks;
}

/**
 * Lazy proxy so importing this module during `next build` does not require
 * LIVEBLOCKS_SECRET_KEY. The client is created on first property access at runtime.
 */
export const liveblocks: Liveblocks = new Proxy({} as Liveblocks, {
  get(_target, prop, receiver) {
    const client = getLiveblocksClient();
    const value = Reflect.get(client, prop, receiver);

    if (typeof value === "function") {
      return value.bind(client);
    }

    return value;
  },
});

/**
 * Deterministically map a user ID to a consistent color from the fixed palette.
 */
export function getCursorColor(userId: string): string {
  let hash = 0;

  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }

  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
}
