"use client";

import { EditorDialog } from "@/components/editor/editor-dialog";
import {
  CANVAS_TEMPLATES,
  getTemplateBounds,
  getTemplateNodeCenter,
  getTemplateNodeSize,
  type CanvasTemplate,
} from "@/components/editor/starter-templates";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_EDGE_COLOR,
  getNodeTextColor,
  type NodeShape,
} from "@/types/canvas";

const PREVIEW_HEIGHT = 148;
const PREVIEW_PADDING = 36;

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Starter templates"
      description="Import a pre-built system design into this canvas."
      className="sm:max-w-4xl"
      footer={
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      }
    >
      <div className="max-h-[min(36rem,70vh)] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {CANVAS_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onImport={() => onImport(template)}
            />
          ))}
        </div>
      </div>
    </EditorDialog>
  );
}

interface TemplateCardProps {
  template: CanvasTemplate;
  onImport: () => void;
}

function TemplateCard({ template, onImport }: TemplateCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-surface p-3">
      <TemplatePreview template={template} />
      <div className="min-h-0 flex-1 space-y-1">
        <h3 className="text-sm font-medium text-copy">{template.name}</h3>
        <p className="text-xs leading-relaxed text-copy-muted">
          {template.description}
        </p>
      </div>
      <Button type="button" size="sm" onClick={onImport}>
        Import
      </Button>
    </article>
  );
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const bounds = getTemplateBounds(template.nodes);
  const viewX = bounds.minX - PREVIEW_PADDING;
  const viewY = bounds.minY - PREVIEW_PADDING;
  const viewWidth = bounds.width + PREVIEW_PADDING * 2;
  const viewHeight = bounds.height + PREVIEW_PADDING * 2;
  const nodesById = new Map(template.nodes.map((node) => [node.id, node]));

  return (
    <div
      className="overflow-hidden rounded-xl border border-surface-border bg-base"
      style={{ width: "100%", height: PREVIEW_HEIGHT }}
    >
      <svg
        width="100%"
        height={PREVIEW_HEIGHT}
        viewBox={`${viewX} ${viewY} ${viewWidth} ${viewHeight}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`${template.name} diagram preview`}
        className="pointer-events-none block"
      >
        {template.edges.map((edge) => {
          const source = nodesById.get(edge.source);
          const target = nodesById.get(edge.target);
          if (!source || !target) {
            return null;
          }

          const start = getTemplateNodeCenter(source);
          const end = getTemplateNodeCenter(target);

          return (
            <line
              key={edge.id}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={DEFAULT_EDGE_COLOR}
              strokeWidth={2}
              strokeLinecap="round"
              opacity={0.45}
            />
          );
        })}
        {template.nodes.map((node) => {
          const { width, height } = getTemplateNodeSize(node);
          const fill = node.data.color;
          const textColor = getNodeTextColor(fill);

          return (
            <g
              key={node.id}
              transform={`translate(${node.position.x} ${node.position.y})`}
            >
              <PreviewNodeShape
                shape={node.data.shape}
                width={width}
                height={height}
                fill={fill}
              />
              {node.data.label ? (
                <text
                  x={width / 2}
                  y={height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={textColor}
                  fontSize={14}
                  fontWeight={500}
                >
                  {node.data.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

interface PreviewNodeShapeProps {
  shape: NodeShape;
  width: number;
  height: number;
  fill: string;
}

function PreviewNodeShape({
  shape,
  width,
  height,
  fill,
}: PreviewNodeShapeProps) {
  const stroke = "var(--border-default)";
  const strokeWidth = 1.5;

  if (shape === "rectangle") {
    return (
      <rect
        width={width}
        height={height}
        rx={12}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (shape === "pill") {
    return (
      <rect
        width={width}
        height={height}
        rx={height / 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (shape === "circle") {
    return (
      <ellipse
        cx={width / 2}
        cy={height / 2}
        rx={width / 2}
        ry={height / 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      overflow="visible"
    >
      {shape === "diamond" ? (
        <polygon
          points="50,2 98,50 50,98 2,50"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
      {shape === "hexagon" ? (
        <polygon
          points="50,3 97,27 97,73 50,97 3,73 3,27"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
      {shape === "cylinder" ? (
        <>
          <path
            d="M4 16 L4 82 A46 12 0 0 0 96 82 L96 16"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
          <ellipse
            cx="50"
            cy="16"
            rx="46"
            ry="12"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        </>
      ) : null}
    </svg>
  );
}
