"use client";

import { SummaryData } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";

export function SummaryStats({ data }: { data: SummaryData }) {
  const isTradeNegative = data.total_trade_change_percent < 0;
  const isPricePositive = data.total_price_change_percent > 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="shadow-none border border-border/50 bg-card">
        <CardContent className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0 text-sm">
            <h3 className="tracking-tight text-muted-foreground font-medium uppercase text-xs">Total Trade Change</h3>
            {isTradeNegative ? (
              <TrendingDown className="h-4 w-4 text-impact-low" />
            ) : (
              <TrendingUp className="h-4 w-4 text-impact-high" />
            )}
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono tracking-tighter ${isTradeNegative ? "text-impact-low" : "text-impact-high"}`}>
              {data.total_trade_change_percent > 0 ? "+" : ""}{data.total_trade_change_percent}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Impact on overall global trade volume</p>
        </CardContent>
      </Card>

      <Card className="shadow-none border border-border/50 bg-card">
        <CardContent className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0 text-sm">
            <h3 className="tracking-tight text-muted-foreground font-medium uppercase text-xs">Average Price Increase</h3>
            {isPricePositive ? (
              <TrendingUp className="h-4 w-4 text-impact-high" />
            ) : (
              <TrendingDown className="h-4 w-4 text-impact-low" />
            )}
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono tracking-tighter ${isPricePositive ? "text-impact-high" : "text-impact-low"}`}>
              {data.total_price_change_percent > 0 ? "+" : ""}{data.total_price_change_percent}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Estimated increase in consumer costs</p>
        </CardContent>
      </Card>

      <Card className="shadow-none border border-border/50 bg-card">
        <CardContent className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0 text-sm">
            <h3 className="tracking-tight text-muted-foreground font-medium uppercase text-xs">Top Affected Industries</h3>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.top_affected_industries.map((ind) => (
              <div key={ind} className="bg-muted px-2.5 py-1 rounded-md text-xs font-semibold text-foreground border border-border">
                {ind}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Sectors experiencing the highest volatility</p>
        </CardContent>
      </Card>
    </div>
  );
}
