"use client";

import { PriceEffect } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export function PriceEffectsChart({ data }: { data: PriceEffect[] }) {
  const chartData = data.map((d) => ({
    name: d.industry.charAt(0).toUpperCase() + d.industry.slice(1),
    change: d.price_change_percent,
  }));

  return (
    <Card className="shadow-none border border-border bg-card">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Price Increases
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Effects of tariffs across key industries
          </p>
        </div>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--muted-foreground)"
                strokeOpacity={0.2}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                // Handle signs dynamically
                tickFormatter={(val) => `${val > 0 ? "+" : ""}${val}%`}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    const isPositive = d.change > 0;
                    return (
                      <div className="rounded-lg border border-border bg-card p-2 shadow-sm">
                        <div className="flex flex-col gap-1 text-sm font-medium">
                          <span className="text-muted-foreground uppercase text-[10px] tracking-widest">
                            {d.name}
                          </span>
                          {/* Dynamic color for tooltip text */}
                          <span
                            className={`font-mono font-bold ${isPositive ? "text-[#10b981]" : "text-[#f43f5e]"}`}
                          >
                            {isPositive ? "+" : ""}
                            {d.change}%
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="change" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    // Green (#10b981) for > 0, Red (#f43f5e) for <= 0
                    fill={entry.change > 0 ? "#10b981" : "#f43f5e"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
