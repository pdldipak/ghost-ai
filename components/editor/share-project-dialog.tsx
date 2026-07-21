"use client";

import { Check, Copy, Link2, UserMinus } from "lucide-react";

import { EditorDialog } from "@/components/editor/editor-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ShareCollaborator } from "@/hooks/use-share-dialog";

interface ShareProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  isOwner: boolean;
  inviteEmail: string;
  collaborators: ShareCollaborator[];
  isLoading: boolean;
  isInviting: boolean;
  removingEmail: string | null;
  linkCopied: boolean;
  error: string | null;
  onInviteEmailChange: (email: string) => void;
  onInvite: () => void;
  onRemove: (email: string) => void;
  onCopyLink: () => void;
}

function CollaboratorAvatar({
  name,
  email,
  imageUrl,
}: {
  name: string | null;
  email: string;
  imageUrl: string | null;
}) {
  const label = name ?? email;
  const initial = label.trim().charAt(0).toUpperCase() || "?";

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Clerk CDN avatars
      <img
        src={imageUrl}
        alt=""
        className="size-8 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div
      aria-hidden
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-dim text-xs font-medium text-brand"
    >
      {initial}
    </div>
  );
}

export function ShareProjectDialog({
  open,
  onOpenChange,
  projectName,
  isOwner,
  inviteEmail,
  collaborators,
  isLoading,
  isInviting,
  removingEmail,
  linkCopied,
  error,
  onInviteEmailChange,
  onInvite,
  onRemove,
  onCopyLink,
}: ShareProjectDialogProps) {
  const handleInviteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onInvite();
  };

  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Share project"
      description={
        isOwner
          ? `Invite collaborators to "${projectName}" or copy the project link.`
          : `People with access to "${projectName}".`
      }
      className="sm:max-w-lg"
      footer={
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-surface-border bg-surface px-3 py-2 text-sm text-copy-muted">
            <Link2 className="size-4 shrink-0" />
            <span className="truncate">Project link</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCopyLink}
            aria-label={linkCopied ? "Link copied" : "Copy project link"}
          >
            {linkCopied ? <Check /> : <Copy />}
            {linkCopied ? "Copied!" : "Copy"}
          </Button>
        </div>

        {isOwner ? (
          <form onSubmit={handleInviteSubmit} className="space-y-2">
            <label
              htmlFor="share-invite-email"
              className="text-sm text-copy-secondary"
            >
              Invite by email
            </label>
            <div className="flex gap-2">
              <Input
                id="share-invite-email"
                type="email"
                value={inviteEmail}
                onChange={(event) => onInviteEmailChange(event.target.value)}
                placeholder="colleague@example.com"
                disabled={isInviting}
                autoComplete="email"
              />
              <Button
                type="submit"
                disabled={isInviting || !inviteEmail.trim()}
              >
                {isInviting ? "Inviting..." : "Invite"}
              </Button>
            </div>
          </form>
        ) : null}

        <div className="space-y-2">
          <p className="text-sm text-copy-secondary">Collaborators</p>

          {isLoading ? (
            <p className="text-sm text-copy-muted">Loading...</p>
          ) : collaborators.length === 0 ? (
            <p className="text-sm text-copy-muted">
              {isOwner
                ? "No collaborators yet. Invite someone by email."
                : "No other collaborators."}
            </p>
          ) : (
            <ScrollArea className="max-h-56">
              <ul className="space-y-2 pr-2">
                {collaborators.map((collaborator) => (
                  <li
                    key={collaborator.id}
                    className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface px-3 py-2"
                  >
                    <CollaboratorAvatar
                      name={collaborator.name}
                      email={collaborator.email}
                      imageUrl={collaborator.imageUrl}
                    />
                    <div className="min-w-0 flex-1">
                      {collaborator.name ? (
                        <>
                          <p className="truncate text-sm font-medium text-copy">
                            {collaborator.name}
                          </p>
                          <p className="truncate text-xs text-copy-muted">
                            {collaborator.email}
                          </p>
                        </>
                      ) : (
                        <p className="truncate text-sm text-copy">
                          {collaborator.email}
                        </p>
                      )}
                    </div>
                    {isOwner ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onRemove(collaborator.email)}
                        disabled={removingEmail === collaborator.email}
                        aria-label={`Remove ${collaborator.email}`}
                      >
                        <UserMinus />
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </EditorDialog>
  );
}
