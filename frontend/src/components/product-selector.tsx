"use client";

import { Product } from "@/lib/products";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductSelectorProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelect: (product: Product) => void;
}

export function ProductSelector({
  products,
  selectedProduct,
  onSelect,
}: ProductSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Select a Product
        </h2>
        <p className="text-muted-foreground">
          Choose a product to simulate tariff impacts across its supply chain.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const isSelected = selectedProduct?.id === product.id;
          return (
            <Card
              key={product.id}
              className={cn(
                "group cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                isSelected
                  ? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/10"
                  : "hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"
              )}
              onClick={() => onSelect(product)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{product.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          ${product.basePrice.toLocaleString()} {product.unit}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary shrink-0">
                      <svg
                        className="h-3.5 w-3.5 text-primary-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {product.topExporters.slice(0, 3).map((exp) => (
                    <Badge
                      key={exp.country}
                      variant="secondary"
                      className="text-xs font-normal"
                    >
                      {exp.flag} {exp.country}
                    </Badge>
                  ))}
                  {product.topExporters.length > 3 && (
                    <Badge variant="secondary" className="text-xs font-normal">
                      +{product.topExporters.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/60" />
                  {product.supplyChain.length} supply chain stages
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-ripple-amber/60" />
                  {Math.round(product.importDependency * 100)}% import dependent
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
