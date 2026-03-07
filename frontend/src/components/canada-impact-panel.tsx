"use client";

import { CanadaImpact } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Factory, TreePine, Wheat } from "lucide-react";

const sectorIcon = (sector: string) => {
  if (sector.toLowerCase() === "lumber") return <TreePine className="h-5 w-5 text-green-700 dark:text-green-400" />;
  if (sector.toLowerCase() === "automobile") return <Factory className="h-5 w-5 text-blue-700 dark:text-blue-400" />;
  if (sector.toLowerCase() === "agriculture") return <Wheat className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
  return <Factory className="h-5 w-5" />;
};

export function CanadaImpactPanel({ data }: { data: CanadaImpact[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
         <div>
           <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
             <span className="text-lg">🍁</span> Canadian Sector Impact
           </h3>
           <p className="text-xs text-muted-foreground mt-0.5">Estimated effects on domestic production and exports</p>
         </div>
      </div>
      
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((item) => {
          const changeVal = item.export_change_percent ?? item.production_change_percent ?? 0;
          const isNegative = changeVal < 0;
          const isExport = item.export_change_percent !== undefined;
          
          return (
            <Card key={item.sector} className="shadow-none border border-border bg-card overflow-hidden hover:border-border/80 transition-colors">
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-muted rounded-md border border-border">
                      {sectorIcon(item.sector)}
                    </div>
                    <span className="font-semibold text-sm">{item.sector}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                      {isExport ? "Export Change" : "Production Change"}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-2xl font-bold font-mono tracking-tight", isNegative ? "text-impact-high" : "text-impact-low")}>
                        {changeVal > 0 ? "+" : ""}{changeVal}%
                      </span>
                      {isNegative ? (
                        <TrendingDown className="h-4 w-4 text-impact-high" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-impact-low" />
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-border/60">
                    <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                      Export Value
                    </h4>
                    <p className="text-sm font-semibold font-mono tabular-nums">
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
