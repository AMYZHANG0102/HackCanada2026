"use client";

import { useMemo } from "react";
import { Product } from "@/lib/products";
import { simulateTariff, TariffSimulationResult } from "@/lib/tariff-engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface TariffSimulatorProps {
  product: Product;
  country: string;
  tariffRate: number;
  onCountryChange: (country: string) => void;
  onTariffChange: (rate: number) => void;
}

export function TariffSimulator({
  product,
  country,
  tariffRate,
  onCountryChange,
  onTariffChange,
}: TariffSimulatorProps) {
  const result: TariffSimulationResult = useMemo(
    () => simulateTariff(product, country, tariffRate),
    [product, country, tariffRate]
  );

  const severityColor = (percent: number) => {
    if (percent <= 2) return "text-ripple-green";
    if (percent <= 5) return "text-ripple-amber";
    return "text-ripple-red";
  };

  const severityBg = (percent: number) => {
    if (percent <= 2) return "bg-ripple-green/15 text-ripple-green border-ripple-green/30";
    if (percent <= 5) return "bg-ripple-amber/15 text-ripple-amber border-ripple-amber/30";
    return "bg-ripple-red/15 text-ripple-red border-ripple-red/30";
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Tariff Simulator
        </h2>
        <p className="text-muted-foreground">
          Adjust the tariff rate on{" "}
          <span className="font-medium text-foreground">
            {product.icon} {product.name}
          </span>{" "}
          and see how costs ripple through the economy.
        </p>
      </div>

      {/* Controls */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Country Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Exporting Country
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={country} onValueChange={(v) => { if (v) onCountryChange(v); }}>
              <SelectTrigger className="w-full" id="country-select">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {product.topExporters.map((exp) => (
                  <SelectItem key={exp.country} value={exp.country}>
                    <span className="flex items-center gap-2">
                      <span>{exp.flag}</span>
                      <span>{exp.country}</span>
                      <span className="text-muted-foreground text-xs ml-auto">
                        ({exp.sharePercent}% share)
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {result.countryExporter && (
              <p className="mt-2 text-xs text-muted-foreground">
                Current base tariff: {result.countryExporter.baseTariff}%
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tariff Slider */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Additional Tariff Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span
                className={`text-4xl font-bold tabular-nums transition-colors duration-300 ${severityColor(tariffRate)}`}
              >
                {tariffRate}%
              </span>
              <span className="text-xs text-muted-foreground">0% — 50%</span>
            </div>
            <Slider
              id="tariff-slider"
              value={[tariffRate]}
              onValueChange={(v) => onTariffChange(Array.isArray(v) ? v[0] : (v as unknown as number))}
              min={0}
              max={50}
              step={1}
              className="w-full"
            />
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Impact Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Price Impact by Stage</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {result.stageImpacts.map((impact, i) => (
            <Card
              key={impact.stageName}
              className="relative overflow-hidden transition-all duration-500"
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Stage {i + 1}
                  </p>
                  <p className="text-sm font-semibold">{impact.stageName}</p>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-2xl font-bold tabular-nums animate-number-pop ${severityColor(impact.priceIncreasePercent)}`}
                      key={`${impact.priceIncreasePercent}-${tariffRate}`}
                    >
                      +{impact.priceIncreasePercent}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +${impact.absoluteIncrease.toLocaleString()}
                  </p>
                  {impact.priceIncreasePercent > 0 && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${severityBg(impact.priceIncreasePercent)}`}
                    >
                      {impact.priceIncreasePercent <= 2
                        ? "Low Impact"
                        : impact.priceIncreasePercent <= 5
                          ? "Moderate"
                          : "High Impact"}
                    </Badge>
                  )}
                </div>
              </CardContent>
              {/* Severity bar at bottom */}
              <div
                className="h-1 transition-all duration-500"
                style={{
                  width: `${Math.min(impact.priceIncreasePercent * 5, 100)}%`,
                  backgroundColor:
                    impact.priceIncreasePercent <= 2
                      ? "oklch(0.72 0.17 145)"
                      : impact.priceIncreasePercent <= 5
                        ? "oklch(0.78 0.15 75)"
                        : "oklch(0.65 0.2 25)",
                }}
              />
            </Card>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              Retail Price Change
            </p>
            <p
              className={`text-3xl font-bold tabular-nums ${severityColor(result.totalRetailIncrease)}`}
            >
              +{result.totalRetailIncrease}%
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              New Estimated Price
            </p>
            <p className="text-3xl font-bold tabular-nums text-foreground">
              ${result.newBasePrice.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {product.unit}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              Trade Volume Impact
            </p>
            <p className="text-3xl font-bold tabular-nums text-ripple-amber">
              -{result.tradeVolumeReduction}%
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
