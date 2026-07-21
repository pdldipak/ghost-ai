"use client";

import { useCallback, useEffect, useState } from "react";

export interface ShareCollaborator {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  createdAt: string;
}

interface CollaboratorsResponse {
  collaborators: ShareCollaborator[];
  isOwner: boolean;
}

export interface UseShareDialogOptions {
  projectId: string | undefined;
  isOwner: boolean;
}

export interface UseShareDialogReturn {
  open: boolean;
  inviteEmail: string;
  collaborators: ShareCollaborator[];
  isOwner: boolean;
  isLoading: boolean;
  isInviting: boolean;
  removingEmail: string | null;
  linkCopied: boolean;
  error: string | null;
  openDialog: () => void;
  closeDialog: () => void;
  setInviteEmail: (email: string) => void;
  handleInvite: () => Promise<void>;
  handleRemove: (email: string) => Promise<void>;
  handleCopyLink: () => Promise<void>;
}

export function useShareDialog({
  projectId,
  isOwner,
}: UseShareDialogOptions): UseShareDialogReturn {
  const [open, setOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [collaborators, setCollaborators] = useState<ShareCollaborator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setInviteEmail("");
    setError(null);
    setLinkCopied(false);
    setIsLoading(false);
    setIsInviting(false);
    setRemovingEmail(null);
  }, []);

  const loadCollaborators = useCallback(async () => {
    if (!projectId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`);

      if (!response.ok) {
        setError("Failed to load collaborators");
        setIsLoading(false);
        return;
      }

      const data = (await response.json()) as CollaboratorsResponse;
      setCollaborators(data.collaborators);
      setIsLoading(false);
    } catch {
      setError("Failed to load collaborators");
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!open || !projectId) {
      return;
    }

    void loadCollaborators();
  }, [loadCollaborators, open, projectId]);

  const openDialog = useCallback(() => {
    if (!projectId) {
      return;
    }

    setInviteEmail("");
    setError(null);
    setLinkCopied(false);
    setOpen(true);
  }, [projectId]);

  const handleInvite = useCallback(async () => {
    if (!projectId || !isOwner) {
      return;
    }

    const trimmed = inviteEmail.trim();
    if (!trimmed) {
      return;
    }

    setIsInviting(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "Failed to invite collaborator");
        setIsInviting(false);
        return;
      }

      const data = (await response.json()) as {
        collaborator: ShareCollaborator;
      };

      setCollaborators((current) => [...current, data.collaborator]);
      setInviteEmail("");
      setIsInviting(false);
    } catch {
      setError("Failed to invite collaborator");
      setIsInviting(false);
    }
  }, [inviteEmail, isOwner, projectId]);

  const handleRemove = useCallback(
    async (email: string) => {
      if (!projectId || !isOwner) {
        return;
      }

      setRemovingEmail(email);
      setError(null);

      try {
        const response = await fetch(
          `/api/projects/${projectId}/collaborators`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          },
        );

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          setError(data?.error ?? "Failed to remove collaborator");
          setRemovingEmail(null);
          return;
        }

        setCollaborators((current) =>
          current.filter((collaborator) => collaborator.email !== email),
        );
        setRemovingEmail(null);
      } catch {
        setError("Failed to remove collaborator");
        setRemovingEmail(null);
      }
    },
    [isOwner, projectId],
  );

  const handleCopyLink = useCallback(async () => {
    if (!projectId || typeof window === "undefined") {
      return;
    }

    const link = `${window.location.origin}/editor/${projectId}`;

    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setError("Failed to copy link");
    }
  }, [projectId]);

  return {
    open,
    inviteEmail,
    collaborators,
    isOwner,
    isLoading,
    isInviting,
    removingEmail,
    linkCopied,
    error,
    openDialog,
    closeDialog,
    setInviteEmail,
    handleInvite,
    handleRemove,
    handleCopyLink,
  };
}
