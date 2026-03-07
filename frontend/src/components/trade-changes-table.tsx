"use client";

import { TradeChange } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp, ArrowRight } from "lucide-react";

export function TradeChangesTable({ data }: { data: TradeChange[] }) {
  return (
    <Card className="shadow-none border border-border bg-card overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 border-b border-border/50">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            Trade Changes
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/30">
              <tr>
                <th className="px-4 py-2.5 font-medium border-b border-border text-center">Flow</th>
                <th className="px-4 py-2.5 font-medium border-b border-border">Product</th>
                <th className="px-4 py-2.5 font-medium border-b border-border text-right">Change</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => {
                const isNegative = row.change_percent < 0;
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/10 transition-colors last:border-0">
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center justify-center gap-3">
                        <span className="font-semibold text-foreground/80">{row.exporter}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/60" />
                        <span className="font-semibold text-foreground">{row.importer}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        {row.product}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className={`font-mono font-bold tracking-tight ${isNegative ? "text-impact-low" : "text-impact-high"}`}>
                          {row.change_percent > 0 ? "+" : ""}{row.change_percent}%
                        </span>
                        {isNegative ? (
                          <TrendingDown className="h-4 w-4 text-impact-low" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-impact-high" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
