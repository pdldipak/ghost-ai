"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { shallow, useOthersMapped } from "@liveblocks/react/suspense";

import { cn } from "@/lib/utils";

const MAX_VISIBLE_AVATARS = 5;
const AVATAR_SIZE_CLASS = "size-7";

interface CollaboratorInfo {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function CollaboratorAvatar({ collaborator }: { collaborator: CollaboratorInfo }) {
  const initials = getInitials(collaborator.name);
  const hasPhoto = collaborator.avatar.trim().length > 0;

  return (
    <div
      className={cn(
        AVATAR_SIZE_CLASS,
        "relative overflow-hidden rounded-full border-2 border-base",
      )}
      style={{ backgroundColor: collaborator.color }}
      aria-hidden
    >
      {hasPhoto ? (
        <div
          className="size-full bg-cover bg-center"
          style={{ backgroundImage: `url(${collaborator.avatar})` }}
        />
      ) : (
        <span
          className="flex size-full items-center justify-center text-[10px] font-medium"
          style={{ color: "var(--bg-base)" }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

export function PresenceAvatars() {
  const { userId } = useAuth();
  const others = useOthersMapped(
    (other) => ({
      id: other.id,
      name: other.info.name,
      avatar: other.info.avatar,
      color: other.info.color,
    }),
    shallow,
  );

  const collaborators: CollaboratorInfo[] = [];
  const seen = new Set<string>();

  for (const [, other] of others) {
    if (!other.id || other.id === userId || seen.has(other.id)) {
      continue;
    }

    seen.add(other.id);
    collaborators.push(other);
  }

  const visible = collaborators.slice(0, MAX_VISIBLE_AVATARS);
  const overflow = collaborators.length - visible.length;
  const hasCollaborators = collaborators.length > 0;

  return (
    <div className="pointer-events-none absolute top-4 right-4 z-20">
      <div className="flex items-center gap-2" aria-label="Active collaborators">
        {hasCollaborators ? (
          <>
            <div className="flex items-center -space-x-2">
              {visible.map((collaborator) => (
                <CollaboratorAvatar
                  key={collaborator.id}
                  collaborator={collaborator}
                />
              ))}
              {overflow > 0 ? (
                <div
                  className={cn(
                    AVATAR_SIZE_CLASS,
                    "relative flex items-center justify-center rounded-full border-2 border-base bg-elevated text-[10px] font-medium text-copy-muted",
                  )}
                  aria-hidden
                >
                  +{overflow}
                </div>
              ) : null}
            </div>
            <div className="h-4 w-px bg-surface-border" aria-hidden />
          </>
        ) : null}
        <div className="pointer-events-auto">
          <UserButton
            appearance={{
              elements: {
                avatarBox: AVATAR_SIZE_CLASS,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
