"use client";

import { useMemo } from "react";
import { Product } from "@/lib/products";
import { getAlternativeSuppliers } from "@/lib/tariff-engine";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AlternativeSuppliersProps {
  product: Product;
  country: string;
  tariffRate: number;
}

export function AlternativeSuppliers({
  product,
  country,
  tariffRate,
}: AlternativeSuppliersProps) {
  const alternatives = useMemo(
    () => getAlternativeSuppliers(product, country, tariffRate),
    [product, country, tariffRate]
  );

  if (tariffRate === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Alternative Suppliers
          </h2>
          <p className="text-muted-foreground">
            Increase the tariff rate to see alternative sourcing options.
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-4xl mb-3">🔍</span>
            <p className="text-muted-foreground">
              Set a tariff above 0% to discover alternative trade routes
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Alternative Suppliers
        </h2>
        <p className="text-muted-foreground">
          If tariffs on{" "}
          <span className="font-medium text-foreground">
            {product.icon} {product.name}
          </span>{" "}
          from{" "}
          <span className="font-medium text-foreground">{country}</span>{" "}
          increase, consider these alternatives:
        </p>
      </div>

      {alternatives.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-4xl mb-3">⚠️</span>
            <p className="text-muted-foreground">
              No significantly cheaper alternatives found for this product.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Consider domestic production options.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {alternatives.map((alt, i) => (
            <Card
              key={alt.country}
              className="group transition-all duration-300 hover:shadow-md hover:shadow-ripple-green/5 hover:border-ripple-green/40"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{alt.flag}</span>
                    <div>
                      <p className="font-semibold text-lg">{alt.country}</p>
                      <p className="text-xs text-muted-foreground">
                        Current import share: {alt.currentShare}%
                      </p>
                    </div>
                  </div>
                  {i === 0 && (
                    <Badge className="bg-ripple-green/15 text-ripple-green border-ripple-green/30">
                      Best Alternative
                    </Badge>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Current Tariff
                    </p>
                    <p className="text-lg font-bold tabular-nums text-ripple-green">
                      {alt.currentTariff}%
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Tariff Savings
                    </p>
                    <p className="text-lg font-bold tabular-nums text-ripple-green">
                      -{alt.tariffDifference}%
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Price Savings
                    </p>
                    <p className="text-lg font-bold tabular-nums text-ripple-green">
                      ~{alt.potentialSavingsPercent}%
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <svg className="h-3.5 w-3.5 text-ripple-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Switch from {country} → {alt.country}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Domestic production option */}
      <Card className="border-dashed border-ripple-blue/30 bg-ripple-blue/5">
        <CardContent className="flex items-center gap-4 p-4">
          <span className="text-2xl">🏭</span>
          <div>
            <p className="font-semibold text-sm">Consider Domestic Production</p>
            <p className="text-xs text-muted-foreground">
              At {tariffRate}% tariff, domestic manufacturing may become
              cost-competitive for {product.name.toLowerCase()}.
              Import dependency: {Math.round(product.importDependency * 100)}%.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
