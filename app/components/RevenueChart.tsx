"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/app/lib/calc";

type Point = { month: string; revenue: number };

const WIDTH = 640;
const HEIGHT = 220;
const PAD_LEFT = 56;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 32;

function niceMax(value: number): number {
  if (value <= 0) return 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  let niceNormalized;
  if (normalized <= 1) niceNormalized = 1;
  else if (normalized <= 2) niceNormalized = 2;
  else if (normalized <= 5) niceNormalized = 5;
  else niceNormalized = 10;
  return niceNormalized * magnitude;
}

function monthLabel(month: string): string {
  const [, m] = month.split("-");
  return `${Number(m)}월`;
}

export default function RevenueChart({
  title,
  data,
}: {
  title: string;
  data: Point[];
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const max = useMemo(() => niceMax(Math.max(...data.map((d) => d.revenue), 0)), [data]);
  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const points = useMemo(
    () =>
      data.map((d, i) => {
        const x =
          data.length === 1
            ? PAD_LEFT + plotWidth / 2
            : PAD_LEFT + (i / (data.length - 1)) * plotWidth;
        const y = PAD_TOP + plotHeight - (d.revenue / max) * plotHeight;
        return { x, y, ...d };
      }),
    [data, max, plotWidth, plotHeight]
  );

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${PAD_TOP + plotHeight} L ${points[0].x} ${
          PAD_TOP + plotHeight
        } Z`
      : "";

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (points.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let nearestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  }

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>

      {data.length === 0 || data.every((d) => d.revenue === 0) ? (
        <p className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
          표시할 매출 데이터가 없습니다.
        </p>
      ) : (
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="mt-3 w-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {yTicks.map((tick) => {
            const y = PAD_TOP + plotHeight - (tick / max) * plotHeight;
            return (
              <g key={tick}>
                <line
                  x1={PAD_LEFT}
                  x2={WIDTH - PAD_RIGHT}
                  y1={y}
                  y2={y}
                  style={{ stroke: "var(--chart-grid)" }}
                  strokeWidth={1}
                />
                <text
                  x={PAD_LEFT - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={11}
                  style={{ fill: "var(--chart-muted)" }}
                >
                  {tick >= 1000 ? `${Math.round(tick / 100) / 10}K` : tick}
                </text>
              </g>
            );
          })}

          <path d={areaPath} style={{ fill: "var(--chart-line)" }} fillOpacity={0.1} stroke="none" />
          <path
            d={linePath}
            fill="none"
            style={{ stroke: "var(--chart-line)" }}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {points.map((p, i) => (
            <text
              key={`label-${p.month}`}
              x={p.x}
              y={HEIGHT - 8}
              textAnchor="middle"
              fontSize={11}
              style={{ fill: "var(--chart-muted)" }}
            >
              {i === 0 || i === points.length - 1 || points.length <= 8 ? monthLabel(p.month) : ""}
            </text>
          ))}

          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={4}
              style={{ fill: "var(--chart-line)", stroke: "var(--chart-surface)" }}
              strokeWidth={2}
            />
          )}

          {hoverIndex !== null && points[hoverIndex] && (
            <g>
              <line
                x1={points[hoverIndex].x}
                x2={points[hoverIndex].x}
                y1={PAD_TOP}
                y2={PAD_TOP + plotHeight}
                style={{ stroke: "var(--chart-crosshair)" }}
                strokeWidth={1}
              />
              <circle
                cx={points[hoverIndex].x}
                cy={points[hoverIndex].y}
                r={4}
                style={{ fill: "var(--chart-line)", stroke: "var(--chart-surface)" }}
                strokeWidth={2}
              />
            </g>
          )}
        </svg>
      )}

      {hoverIndex !== null && points[hoverIndex] && (
        <p className="mt-1 text-center text-sm text-neutral-600 dark:text-neutral-400">
          {points[hoverIndex].month} ·{" "}
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {formatCurrency(points[hoverIndex].revenue)}
          </span>
        </p>
      )}
    </div>
  );
}
