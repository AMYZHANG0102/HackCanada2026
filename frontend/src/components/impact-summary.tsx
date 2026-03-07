"use client";

import { Product } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ImpactSummaryProps {
  product: Product | null;
  country: string;
  tariffRate: number;
}

export function ImpactSummary({
  product,
  country,
  tariffRate,
}: ImpactSummaryProps) {
  if (!product) return null;

  const exporter = product.topExporters.find((e) => e.country === country);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card/50 px-4 py-2.5 text-sm">
      <div className="flex items-center gap-1.5">
        <span className="text-base">{product.icon}</span>
        <span className="font-medium">{product.name}</span>
      </div>
      <Separator orientation="vertical" className="h-4" />
      <div className="flex items-center gap-1.5">
        <span className="text-base">{exporter?.flag || "🌍"}</span>
        <span className="text-muted-foreground">{country}</span>
      </div>
      <Separator orientation="vertical" className="h-4" />
      <Badge
        variant={tariffRate > 0 ? "default" : "secondary"}
        className={
          tariffRate > 20
            ? "bg-ripple-red/15 text-ripple-red border-ripple-red/30"
            : tariffRate > 0
              ? "bg-ripple-amber/15 text-ripple-amber border-ripple-amber/30"
              : ""
        }
      >
        {tariffRate}% tariff
      </Badge>
      <Separator orientation="vertical" className="h-4" />
      <span className="text-xs text-muted-foreground">
        Base: ${product.basePrice.toLocaleString()} {product.unit}
      </span>
    </div>
  );
}
