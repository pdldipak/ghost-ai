import { Lock } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AccessDenied() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-elevated text-copy-muted">
        <Lock className="size-6" aria-hidden />
      </div>
      <h1 className="mt-6 text-xl font-medium text-copy">Access denied</h1>
      <p className="mt-2 max-w-sm text-sm text-copy-muted">
        You don&apos;t have access to this project, or it doesn&apos;t exist.
      </p>
      <Link
        href="/editor"
        className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
      >
        Back to editor
      </Link>
    </div>
  );
}
