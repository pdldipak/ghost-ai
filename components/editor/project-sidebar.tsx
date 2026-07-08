"use client";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

function EmptyTabPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-8">
      <p className="text-center text-sm text-copy-muted">{label}</p>
    </div>
  );
}

export function ProjectSidebar({
  isOpen,
  onClose,
  className,
}: ProjectSidebarProps) {
  return (
    <aside
      aria-hidden={!isOpen}
      className={cn(
        "fixed top-12 left-0 z-40 flex h-[calc(100vh-3rem)] w-80 flex-col border-r border-surface-border bg-surface shadow-lg transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
        <h2 className="text-sm font-medium text-copy">Projects</h2>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close projects sidebar"
        >
          <X />
        </Button>
      </div>

      <Tabs defaultValue="my-projects" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-4 mt-3 w-auto shrink-0">
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>

        <TabsContent
          value="my-projects"
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <EmptyTabPlaceholder label="No projects yet" />
        </TabsContent>

        <TabsContent
          value="shared"
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <EmptyTabPlaceholder label="No shared projects yet" />
        </TabsContent>
      </Tabs>

      <div className="border-t border-surface-border p-4">
        <Button className="w-full">
          <Plus />
          New Project
        </Button>
      </div>
    </aside>
  );
}
