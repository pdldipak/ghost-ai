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

interface EdgeLabelProps {
  edgeId: string;
  label: string;
  isEditing: boolean;
  onStartEditing: () => void;
  onStopEditing: () => void;
}

export function EdgeLabel({
  edgeId,
  label,
  isEditing,
  onStartEditing,
  onStopEditing,
}: EdgeLabelProps) {
  const { updateEdgeData } = useReactFlow();
  const inputRef = useRef<HTMLInputElement>(null);
  const sizerText = label.length > 0 ? label : " ";

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const input = inputRef.current;
    if (!input) {
      return;
    }

    input.focus();
    input.select();
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
      event.preventDefault();
      event.stopPropagation();
      onStartEditing();
    },
    [onStartEditing],
  );

  if (!isEditing && !label) {
    return null;
  }

  return (
    <div
      className="nodrag nopan nowheel pointer-events-auto inline-grid max-w-48 rounded-xl border border-surface-border bg-surface px-1.5 py-0.5 text-xs text-copy"
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
          aria-label="Edge label"
          onChange={onLabelChange}
          onBlur={onStopEditing}
          onKeyDown={onLabelKeyDown}
          className="col-start-1 row-start-1 w-full min-w-[1ch] bg-transparent font-[inherit] text-xs leading-[inherit] outline-none"
        />
      ) : (
        <span className="col-start-1 row-start-1 truncate">{label}</span>
      )}
    </div>
  );
}
