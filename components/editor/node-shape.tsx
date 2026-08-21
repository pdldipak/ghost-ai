import { cn } from "@/lib/utils";
import {
  DEFAULT_NODE_SHAPE,
  type NodeColorFill,
  type NodeShape,
} from "@/types/canvas";

interface NodeShapeVisualProps {
  shape: NodeShape;
  fill: NodeColorFill;
  textColor: string;
  selected: boolean;
  label: string;
  className?: string;
}

const CSS_RADIUS: Record<"rectangle" | "pill" | "circle", string> = {
  rectangle: "rounded-xl",
  pill: "rounded-full",
  circle: "rounded-full",
};

function isCssShape(
  shape: NodeShape,
): shape is "rectangle" | "pill" | "circle" {
  return shape === "rectangle" || shape === "pill" || shape === "circle";
}

export function NodeShapeVisual({
  shape,
  fill,
  textColor,
  selected,
  label,
  className,
}: NodeShapeVisualProps) {
  const resolvedShape = shape ?? DEFAULT_NODE_SHAPE;
  const stroke = selected
    ? "var(--accent-primary)"
    : "var(--border-default)";
  const strokeWidth = selected ? 2 : 1.5;

  return (
    <div
      className={cn("relative h-full w-full", className)}
      style={{ color: textColor }}
    >
      {isCssShape(resolvedShape) ? (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center border px-3 text-center text-sm",
            CSS_RADIUS[resolvedShape],
            selected ? "border-brand" : "border-surface-border",
          )}
          style={{ backgroundColor: fill }}
        >
          <span className="truncate">{label}</span>
        </div>
      ) : (
        <>
          <SvgShape
            shape={resolvedShape}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <div className="relative z-10 flex h-full w-full items-center justify-center px-3 text-center text-sm">
            <span className="truncate">{label}</span>
          </div>
        </>
      )}
    </div>
  );
}

interface SvgShapeProps {
  shape: "diamond" | "hexagon" | "cylinder";
  fill: string;
  stroke: string;
  strokeWidth: number;
}

function SvgShape({ shape, fill, stroke, strokeWidth }: SvgShapeProps) {
  const strokeProps = {
    fill,
    stroke,
    strokeWidth,
    vectorEffect: "non-scaling-stroke" as const,
  };

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full overflow-visible"
      aria-hidden
    >
      {shape === "diamond" ? (
        <polygon
          points="50,2 98,50 50,98 2,50"
          strokeLinejoin="round"
          {...strokeProps}
        />
      ) : null}
      {shape === "hexagon" ? (
        <polygon
          points="50,3 97,27 97,73 50,97 3,73 3,27"
          strokeLinejoin="round"
          {...strokeProps}
        />
      ) : null}
      {shape === "cylinder" ? (
        <>
          <path
            d="M4 16 L4 82 A46 12 0 0 0 96 82 L96 16"
            {...strokeProps}
          />
          <ellipse cx="50" cy="16" rx="46" ry="12" {...strokeProps} />
        </>
      ) : null}
    </svg>
  );
}
