"use client";

import { CanadaImpact } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  TrendingDown,
  TrendingUp,
  Factory,
  TreePine,
  Wheat,
} from "lucide-react";

const sectorIcon = (sector: string) => {
  const s = sector.toLowerCase();
  if (s.includes("lumber") || s.includes("softwood"))
    return <TreePine className="h-5 w-5 text-emerald-600" />;
  if (
    s.includes("automobile") ||
    s.includes("manufacturing") ||
    s.includes("vehicles")
  )
    return <Factory className="h-5 w-5 text-blue-600" />;
  if (s.includes("agriculture") || s.includes("wheat") || s.includes("canola"))
    return <Wheat className="h-5 w-5 text-amber-500" />;
  return <Factory className="h-5 w-5 text-slate-500" />;
};

export function CanadaImpactPanel({ data }: { data: CanadaImpact[] }) {
  return (
    <div className="space-y-5">
      <div className="px-1">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
          <span className="text-base leading-none">🍁</span> Canadian Sector
          Impact
        </h3>
        <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-wider opacity-60">
          Estimated domestic volatility metrics
        </p>
      </div>

      {/* Changed to 1 column for the sidebar view or 3 for full width */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1">
        {data.map((item) => {
          const changeVal =
            item.export_change_percent ?? item.production_change_percent ?? 0;
          const isNegative = changeVal < 0;
          const isExport = item.export_change_percent !== undefined;

          return (
            <Card
              key={item.sector}
              className="group overflow-hidden border-border/40 bg-card/40 shadow-none hover:bg-card/80 transition-all duration-300"
            >
              <CardContent className="p-5">
                {/* Sector Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-background rounded-xl border border-border/50 group-hover:border-primary/30 transition-colors shadow-sm">
                      {sectorIcon(item.sector)}
                    </div>
                    <span className="font-bold text-sm tracking-tight text-foreground/90 leading-tight">
                      {item.sector}
                    </span>
                  </div>
                </div>

                {/* Data Points - Vertical Stacking to avoid the "Pic 1" crowding */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 border-l-2 border-muted pl-3">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                      {isExport ? "Export Change" : "Production"}
                    </h4>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "text-xl font-bold font-data tabular-nums tracking-tighter",
                          isNegative ? "text-red-500" : "text-emerald-500",
                        )}
                      >
                        {changeVal > 0 ? "+" : ""}
                        {changeVal}%
                      </span>
                      {isNegative ? (
                        <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                      ) : (
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 border-l-2 border-muted pl-3">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                      Export Value
                    </h4>
                    <p className="text-xl font-bold font-data text-foreground/80 tracking-tighter tabular-nums">
                      ${(item.export_value / 1000000000).toFixed(1)}B
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
