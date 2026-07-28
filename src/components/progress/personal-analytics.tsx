"use client";

import { useId, useState } from "react";
import { TrendingUp, TrendingDown, Minus, Gauge } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RubricIcon } from "@/components/ui/rubric-icon";

export interface TrendPoint {
  entryId: string;
  date: string; // ISO
  avgScore: number;
}

export interface DimensionStat {
  id: string;
  label: string;
  icon: string;
  avg: number;
  count: number;
  trend: number | null; // last - first, null if <2 data points
}

export interface PersonalAnalyticsProps {
  sessionsEvaluated: number;
  overallAverage: number | null;
  openTopicsCount: number;
  activeBlindSpotsCount: number;
  trend: TrendPoint[];
  dimensions: DimensionStat[];
}

function StatTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Card className="p-4">
      <CardContent className="space-y-1 p-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

/** Simple hand-rolled line+area chart — no charting library needed for a
 * single series. Single hue (--chart-1), thin 2px line, rounded end marker,
 * hover crosshair + tooltip. */
function ScoreTrendChart({ trend }: { trend: TrendPoint[] }) {
  const gradientId = useId();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const width = 640;
  const height = 160;
  const padX = 8;
  const padTop = 12;
  const padBottom = 24;

  const n = trend.length;
  const xFor = (i: number) =>
    n <= 1 ? width / 2 : padX + (i / (n - 1)) * (width - padX * 2);
  const yFor = (score: number) =>
    padTop + (1 - score / 10) * (height - padTop - padBottom);

  const linePoints = trend.map((p, i) => `${xFor(i)},${yFor(p.avgScore)}`);
  const linePath = `M${linePoints.join(" L")}`;
  const areaPath = `${linePath} L${xFor(n - 1)},${height - padBottom} L${xFor(0)},${height - padBottom} Z`;

  const hovered = hoverIdx !== null ? trend[hoverIdx] : null;

  function handleMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * width;
    let closest = 0;
    let closestDist = Infinity;
    trend.forEach((_, i) => {
      const dist = Math.abs(xFor(i) - relX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setHoverIdx(closest);
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full touch-none"
        role="img"
        aria-label="Andamento del voto medio per sessione"
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* recessive baseline */}
        <line
          x1={padX}
          y1={height - padBottom}
          x2={width - padX}
          y2={height - padBottom}
          stroke="var(--border)"
          strokeWidth={1}
        />

        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {trend.map((p, i) => (
          <circle
            key={p.entryId}
            cx={xFor(i)}
            cy={yFor(p.avgScore)}
            r={hoverIdx === i ? 5 : 3}
            fill="var(--chart-1)"
            stroke="var(--card)"
            strokeWidth={hoverIdx === i ? 2 : 0}
          />
        ))}

        {hoverIdx !== null && (
          <line
            x1={xFor(hoverIdx)}
            y1={padTop}
            x2={xFor(hoverIdx)}
            y2={height - padBottom}
            stroke="var(--border)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-sm border border-border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-sm"
          style={{ left: `${(xFor(hoverIdx!) / width) * 100}%` }}
        >
          <span className="font-mono font-medium tabular-nums">
            {hovered.avgScore.toFixed(1)}/10
          </span>{" "}
          <span className="text-muted-foreground">
            ·{" "}
            {new Date(hovered.date).toLocaleDateString("it-IT", {
              day: "2-digit",
              month: "short",
            })}
          </span>
        </div>
      )}
    </div>
  );
}

function DimensionBar({ dim }: { dim: DimensionStat }) {
  const pct = Math.max(0, Math.min(100, (dim.avg / 10) * 100));
  return (
    <div className="flex items-center gap-3">
      <div className="flex w-40 shrink-0 items-center gap-1.5 text-sm text-foreground">
        <RubricIcon icon={dim.icon} className="size-3.5 text-muted-foreground" />
        <span className="truncate">{dim.label}</span>
      </div>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-[var(--chart-1)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-foreground">
        {dim.avg.toFixed(1)}
      </span>
      <span className="w-5 shrink-0">
        {dim.trend === null || dim.trend === 0 ? (
          <Minus className="size-3.5 text-muted-foreground" />
        ) : dim.trend > 0 ? (
          <TrendingUp className="size-3.5 text-accent" />
        ) : (
          <TrendingDown className="size-3.5 text-destructive" />
        )}
      </span>
    </div>
  );
}

export function PersonalAnalytics({
  sessionsEvaluated,
  overallAverage,
  openTopicsCount,
  activeBlindSpotsCount,
  trend,
  dimensions,
}: PersonalAnalyticsProps) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Gauge className="size-4" />
        Panoramica
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Sessioni valutate" value={String(sessionsEvaluated)} />
        <StatTile
          label="Voto medio"
          value={overallAverage !== null ? `${overallAverage.toFixed(1)}/10` : "—"}
        />
        <StatTile label="Temi aperti" value={String(openTopicsCount)} />
        <StatTile label="Pattern attivi" value={String(activeBlindSpotsCount)} />
      </div>

      {trend.length >= 2 && (
        <Card className="p-6">
          <CardContent className="space-y-3 p-0">
            <p className="text-sm font-medium text-foreground">
              Andamento del voto medio
            </p>
            <ScoreTrendChart trend={trend} />
          </CardContent>
        </Card>
      )}

      {dimensions.length > 0 && (
        <Card className="p-6">
          <CardContent className="space-y-4 p-0">
            <p className="text-sm font-medium text-foreground">
              Le tue dimensioni
            </p>
            <div className="space-y-3">
              {dimensions.map((d) => (
                <DimensionBar key={d.id} dim={d} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
