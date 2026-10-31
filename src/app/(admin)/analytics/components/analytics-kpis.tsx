"use client";

export interface Kpi {
  label: string;
  value: string;
  hint: string;
}

export function AnalyticsKpis({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="rounded-2xl border bg-card p-4 shadow-xs"
        >
          <p className="text-sm text-muted-foreground">{kpi.label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
            {kpi.value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
        </div>
      ))}
    </div>
  );
}
