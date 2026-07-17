"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Project } from "@/lib/project-types";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  ownedProjects: Project[];
  sharedProjects: Project[];
  activeProjectId?: string;
  onNewProject: () => void;
  onOpenProject: (project: Project) => void;
  onRenameProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  className?: string;
}

function EmptyTabPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-8">
      <p className="text-center text-sm text-copy-muted">{label}</p>
    </div>
  );
}

interface ProjectListItemProps {
  project: Project;
  isActive: boolean;
  onOpen: (project: Project) => void;
  onRename?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

function ProjectListItem({
  project,
  isActive,
  onOpen,
  onRename,
  onDelete,
}: ProjectListItemProps) {
  const showActions = project.isOwned && onRename && onDelete;

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-elevated",
        isActive && "bg-elevated",
      )}
    >
      <button
        type="button"
        className="min-w-0 flex-1 truncate text-left text-sm text-copy"
        onClick={() => onOpen(project)}
      >
        {project.name}
      </button>

      {showActions ? (
        <div className="flex shrink-0 items-center gap-0.5 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:group-focus-within:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Rename ${project.name}`}
            onClick={() => onRename(project)}
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Delete ${project.name}`}
            onClick={() => onDelete(project)}
          >
            <Trash2 />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function ProjectList({
  projects,
  emptyLabel,
  activeProjectId,
  onOpen,
  onRename,
  onDelete,
}: {
  projects: Project[];
  emptyLabel: string;
  activeProjectId?: string;
  onOpen: (project: Project) => void;
  onRename?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}) {
  if (projects.length === 0) {
    return <EmptyTabPlaceholder label={emptyLabel} />;
  }

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="flex flex-col gap-0.5 px-2 py-2">
        {projects.map((project) => (
          <ProjectListItem
            key={project.id}
            project={project}
            isActive={project.id === activeProjectId}
            onOpen={onOpen}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

export function ProjectSidebar({
  isOpen,
  onClose,
  ownedProjects,
  sharedProjects,
  activeProjectId,
  onNewProject,
  onOpenProject,
  onRenameProject,
  onDeleteProject,
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
          <ProjectList
            projects={ownedProjects}
            emptyLabel="No projects yet"
            activeProjectId={activeProjectId}
            onOpen={onOpenProject}
            onRename={onRenameProject}
            onDelete={onDeleteProject}
          />
        </TabsContent>

        <TabsContent
          value="shared"
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <ProjectList
            projects={sharedProjects}
            emptyLabel="No shared projects yet"
            activeProjectId={activeProjectId}
            onOpen={onOpenProject}
          />
        </TabsContent>
      </Tabs>

      <div className="border-t border-surface-border p-4">
        <Button className="w-full" onClick={onNewProject}>
          <Plus />
          New Project
        </Button>
      </div>
    </aside>
  );
}
