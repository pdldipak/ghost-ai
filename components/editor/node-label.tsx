"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { useReactFlow } from "@xyflow/react";

import { cn } from "@/lib/utils";
import { NODE_LABEL_PLACEHOLDER } from "@/types/canvas";

interface NodeLabelProps {
  nodeId: string;
  label: string;
}

export function NodeLabel({ nodeId, label }: NodeLabelProps) {
  const { updateNodeData } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const displayText = label || NODE_LABEL_PLACEHOLDER;

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.focus();
    textarea.select();
  }, [isEditing]);

  const startEditing = useCallback((event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsEditing(true);
  }, []);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  const onLabelChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(nodeId, { label: event.target.value });
    },
    [nodeId, updateNodeData],
  );

  const onLabelKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setIsEditing(false);
    },
    [],
  );

  const stopCanvasPointer = useCallback(
    (event: PointerEvent<HTMLTextAreaElement>) => {
      event.stopPropagation();
    },
    [],
  );

  return (
    <div
      className="relative flex h-full min-h-0 w-full min-w-0 items-center justify-center"
      onDoubleClick={startEditing}
    >
      <div className="relative max-w-full">
        <span
          className={cn(
            "block max-w-full truncate",
            isEditing && "invisible",
            !label && "opacity-40",
          )}
        >
          {displayText}
        </span>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={label}
            placeholder={NODE_LABEL_PLACEHOLDER}
            rows={1}
            aria-label="Node label"
            onChange={onLabelChange}
            onBlur={stopEditing}
            onKeyDown={onLabelKeyDown}
            onPointerDown={stopCanvasPointer}
            className="nodrag nopan nowheel absolute inset-0 size-full resize-none overflow-hidden bg-transparent text-center font-[inherit] text-sm leading-[inherit] outline-none placeholder:opacity-40"
          />
        ) : null}
      </div>
    </div>
  );
}
