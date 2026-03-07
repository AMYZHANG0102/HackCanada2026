"use client";

import { useMemo } from "react";
import { Product } from "@/lib/products";
import { simulateTariff } from "@/lib/tariff-engine";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SupplyChainFlowProps {
  product: Product;
  country: string;
  tariffRate: number;
}

export function SupplyChainFlow({
  product,
  country,
  tariffRate,
}: SupplyChainFlowProps) {
  const result = useMemo(
    () => simulateTariff(product, country, tariffRate),
    [product, country, tariffRate]
  );

  const exporter = result.countryExporter;

  const severityClass = (percent: number) => {
    if (percent <= 2) return "border-ripple-green/40 shadow-ripple-green/10";
    if (percent <= 5) return "border-ripple-amber/40 shadow-ripple-amber/10";
    return "border-ripple-red/40 shadow-ripple-red/10";
  };

  const severityText = (percent: number) => {
    if (percent <= 2) return "text-ripple-green";
    if (percent <= 5) return "text-ripple-amber";
    return "text-ripple-red";
  };

  const connectorClass = (percent: number) => {
    if (percent > 5) return "flow-connector-warning";
    return "flow-connector";
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Supply Chain Ripple Effect
        </h2>
        <p className="text-muted-foreground">
          See how a{" "}
          <span className="font-semibold text-foreground">{tariffRate}%</span>{" "}
          tariff on{" "}
          <span className="font-semibold text-foreground">
            {product.icon} {product.name}
          </span>{" "}
          from{" "}
          <span className="font-semibold text-foreground">
            {exporter?.flag} {country}
          </span>{" "}
          ripples through each stage.
        </p>
      </div>

      {/* Flow Diagram */}
      <div className="flex flex-col items-center gap-0">
        {/* Source Country Node */}
        <Card
          className={cn(
            "w-full max-w-md transition-all duration-500",
            tariffRate > 0
              ? "animate-ripple-pulse border-primary shadow-lg shadow-primary/10"
              : "border-border"
          )}
        >
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{exporter?.flag || "🌍"}</span>
              <div>
                <p className="font-semibold">{country} Export</p>
                <p className="text-xs text-muted-foreground">
                  {exporter?.sharePercent || 0}% of imports
                </p>
              </div>
            </div>
            {tariffRate > 0 && (
              <Badge className="bg-primary/20 text-primary border-primary/40">
                +{tariffRate}% tariff
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Flow stages */}
        {result.stageImpacts.map((impact, i) => (
          <div key={impact.stageName} className="flex flex-col items-center">
            {/* Connector */}
            <div
              className={cn(
                "w-0.5 h-10 transition-all duration-500",
                tariffRate > 0
                  ? connectorClass(impact.priceIncreasePercent)
                  : "bg-border"
              )}
            />

            {/* Stage Node */}
            <Card
              className={cn(
                "w-full max-w-md transition-all duration-500",
                tariffRate > 0 && impact.priceIncreasePercent > 0
                  ? `shadow-lg ${severityClass(impact.priceIncreasePercent)}`
                  : "border-border"
              )}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{impact.stageName}</p>
                    <p className="text-xs text-muted-foreground">
                      {impact.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "text-xl font-bold tabular-nums transition-colors duration-300",
                      tariffRate > 0
                        ? severityText(impact.priceIncreasePercent)
                        : "text-muted-foreground"
                    )}
                    key={`${impact.priceIncreasePercent}-${tariffRate}`}
                  >
                    {tariffRate > 0
                      ? `+${impact.priceIncreasePercent}%`
                      : "—"}
                  </p>
                  {tariffRate > 0 && impact.absoluteIncrease > 0 && (
                    <p className="text-xs text-muted-foreground">
                      +${impact.absoluteIncrease.toLocaleString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Final connector to consumer */}
        <div
          className={cn(
            "w-0.5 h-10 transition-all duration-500",
            tariffRate > 0 ? "flow-connector" : "bg-border"
          )}
        />

        {/* Consumer Node */}
        <Card className="w-full max-w-md border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛒</span>
              <div>
                <p className="font-semibold">Consumer</p>
                <p className="text-xs text-muted-foreground">Final price impact</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tabular-nums gradient-text">
                ${result.newBasePrice.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {product.unit}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
