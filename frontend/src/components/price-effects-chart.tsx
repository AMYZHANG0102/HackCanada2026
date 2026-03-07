"use client";

import { priceEffectsData } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function PriceEffectsChart() {
  const data = priceEffectsData.price_effects.map(d => ({
    name: d.industry.charAt(0).toUpperCase() + d.industry.slice(1),
    change: d.price_change_percent,
    isCanada: d.country.toLowerCase() === "canada"
  }));

  return (
    <Card className="shadow-none border border-border bg-card">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Price Increases
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Effects of tariffs across key industries</p>
        </div>
        
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `+${val}%`}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip 
                cursor={{ fill: "hsl(var(--muted)/0.4)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-border bg-card p-2 shadow-sm">
                        <div className="flex flex-col gap-1 text-sm font-medium">
                          <span className="text-muted-foreground uppercase text-[10px] tracking-widest">{data.name}</span>
                          <span className="text-impact-high font-mono font-bold">+{data.change}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="change" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isCanada ? "oklch(0.60 0.18 15)" : "oklch(0.62 0.14 70)"} 
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
