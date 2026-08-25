"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { useReactFlow } from "@xyflow/react";

import { cn } from "@/lib/utils";
import { EDGE_LABEL_PLACEHOLDER } from "@/types/canvas";

interface EdgeLabelProps {
  edgeId: string;
  label: string;
  isEditing: boolean;
  showPlaceholder: boolean;
  onStartEditing: () => void;
  onStopEditing: () => void;
}

export function EdgeLabel({
  edgeId,
  label,
  isEditing,
  showPlaceholder,
  onStartEditing,
  onStopEditing,
}: EdgeLabelProps) {
  const { updateEdgeData } = useReactFlow();
  const inputRef = useRef<HTMLInputElement>(null);
  const displayText = label.length > 0 ? label : EDGE_LABEL_PLACEHOLDER;
  const sizerText = isEditing
    ? label.length > 0
      ? label
      : EDGE_LABEL_PLACEHOLDER
    : displayText;

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const input = inputRef.current;
    if (!input) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      input.focus();
      input.select();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isEditing]);

  const onLabelChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      updateEdgeData(edgeId, { label: event.target.value });
    },
    [edgeId, updateEdgeData],
  );

  const onLabelKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Escape" && event.key !== "Enter") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      onStopEditing();
    },
    [onStopEditing],
  );

  const stopCanvasPointer = useCallback((event: PointerEvent<HTMLElement>) => {
    event.stopPropagation();
  }, []);

  const startEditing = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (isEditing) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      onStartEditing();
    },
    [isEditing, onStartEditing],
  );

  if (!isEditing && !label && !showPlaceholder) {
    return null;
  }

  return (
    <div
      className="nodrag nopan nowheel pointer-events-auto inline-grid max-w-48 rounded-xl border border-surface-border bg-surface px-1.5 py-0.5 text-xs text-copy"
      onClick={startEditing}
      onDoubleClick={startEditing}
      onPointerDown={stopCanvasPointer}
    >
      <span className="invisible col-start-1 row-start-1 whitespace-pre">
        {sizerText}
      </span>
      {isEditing ? (
        <input
          ref={inputRef}
          value={label}
          placeholder={EDGE_LABEL_PLACEHOLDER}
          aria-label="Connection purpose"
          onChange={onLabelChange}
          onBlur={onStopEditing}
          onKeyDown={onLabelKeyDown}
          className="col-start-1 row-start-1 w-full min-w-[1ch] bg-transparent font-[inherit] text-xs leading-[inherit] text-copy outline-none placeholder:text-copy-muted"
        />
      ) : (
        <span
          className={cn(
            "col-start-1 row-start-1 truncate",
            !label && "text-copy-muted",
          )}
        >
          {displayText}
        </span>
      )}
    </div>
  );
}
