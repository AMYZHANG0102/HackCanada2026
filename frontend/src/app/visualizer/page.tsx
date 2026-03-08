"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ReactLenis } from "lenis/react";
import { products } from "@/lib/products";
import { generateDashboardData } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import AccessibilityMenu from "@/components/accessibility-menu";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { SummaryStats } from "@/components/summary-stats";
import { CanadaImpactPanel } from "@/components/canada-impact-panel";
import { PriceEffectsChart } from "@/components/price-effects-chart";
import { TradeChangesTable } from "@/components/trade-changes-table";
import { AdvancedMetricsPanel } from "@/components/advanced-metrics-panel";
import { QualitativeInsightsPanel } from "@/components/qualitative-insights-panel";

const TradeMap = dynamic(
  () => import("@/components/trade-map").then((m) => m.TradeMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center text-muted-foreground text-sm font-data">
        Loading map...
      </div>
    ),
  },
);

export default function Home() {
  // Use a stable default to prevent NaN% on initial load
  const [selectedId, setSelectedId] = useState(products[0]?.id || "ketchup");
  const [tariffRate, setTariffRate] = useState(25);
  const [activeTab, setActiveTab] = useState("econ");
  const [isDark, setIsDark] = useState(false);

  // Add this inside your Home component, above the return statement
  const toggleTheme = useCallback(() => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Sync theme on mount
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const product = useMemo(
    () => products.find((p) => p.id === selectedId) || products[0],
    [selectedId],
  );

  const dashboardData = useMemo(() => {
    if (!product) return null;
    return generateDashboardData(
      product.name,
      product.topExporters[0]?.country || "Canada",
      tariffRate,
    );
  }, [product, tariffRate]);

  const exportersData = useMemo(() => {
    if (!product) return [];
    return product.topExporters.map((e) => ({
      country: e.country,
      baseTariff: 0,
      sharePercent: e.sharePercent,
    }));
  }, [product]);

  // Fix Slider Type Error: Slider usually returns an array
  const handleSliderChange = (value: number | readonly number[]) => {
    // Shadcn sliders return an array; we extract the first index safely
    if (Array.isArray(value)) {
      setTariffRate(value[0] ?? 25);
    } else if (typeof value === "number") {
      setTariffRate(value);
    }
  };

  return (
    <ReactLenis root>
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-20 items-center px-8 max-w-[1400px] mx-auto w-full">
            {" "}
            {/* Increased from h-14 to h-20 */}
            <div className="flex items-center gap-10 mr-auto">
              <Link
                href="/"
                className="flex items-center transition-opacity hover:opacity-80"
              >
                <img
                  src={isDark ? "/logos/greyMM.png" : "/logos/blueMM.png"}
                  alt="Maple Margin"
                  // h-10 (40px) usually matches the landing page's impactful logo height
                  className="h-10 w-auto object-contain"
                />
              </Link>
              <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-muted-foreground">
                <Link
                  href="/products"
                  className="hover:text-primary transition-colors"
                >
                  Products
                </Link>
                <Link
                  href="/resources"
                  className="hover:text-primary transition-colors"
                >
                  Resources
                </Link>
                <Link
                  href="/pricing"
                  className="hover:text-primary transition-colors"
                >
                  Pricing
                </Link>
              </nav>
            </div>
            {/* Centered Switcher - Standardized Font */}
            <nav className="absolute left-1/2 -translate-x-1/2 flex items-center bg-muted/50 p-1.5 rounded-full border border-border/20">
              {["Economics", "Nature", "Analysis"].map((label) => {
                const id =
                  label.toLowerCase().slice(0, 4) === "econ"
                    ? "econ"
                    : label.toLowerCase();
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all", // Bumped from 11px to xs
                      activeTab === id
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </nav>
            <div className="ml-auto flex items-center gap-4">
              <AccessibilityMenu />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-10 w-10"
                onClick={toggleTheme}
              >
                {isDark ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* ═══════ SELECTION AREA (Increased Font Sizes) ═══════ */}
        <div className="border-b border-border/10 bg-muted/5 px-8 py-6">
          {" "}
          {/* Increased vertical padding */}
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={cn(
                    "flex items-center gap-2 h-9 rounded-full border px-4 text-sm font-bold transition-all", // Changed text-[11px] to text-sm
                    selectedId === p.id
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-card border-border hover:border-primary/50",
                  )}
                >
                  <span className="text-base">{p.icon}</span> {p.name}
                </button>
              ))}
            </div>

            {/* Standardized Slider Area */}
            <div className="mx-auto max-w-xl flex items-center gap-6 px-6 py-3 bg-card rounded-2xl border border-border shadow-sm">
              <span className="text-xs font-black uppercase tracking-tighter text-muted-foreground">
                Tariff Impact
              </span>
              <Slider
                value={[tariffRate]}
                onValueChange={handleSliderChange}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-data font-black text-sm min-w-[55px] text-center border border-primary/20">
                {tariffRate}%
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ CONTENT (Consistent Margins) ═══════ */}
        {dashboardData ? (
          <main className="flex-1 px-6 py-6 mx-auto w-full max-w-6xl space-y-6">
            <SummaryStats data={dashboardData.summary} />

            {activeTab === "econ" && (
              <div className="grid lg:grid-cols-2 gap-6 animate-fade-up">
                <PriceEffectsChart
                  data={dashboardData.priceEffects.price_effects}
                />
                <TradeChangesTable
                  data={dashboardData.tradeChanges.trade_changes}
                />
              </div>
            )}

            {activeTab === "nature" && (
              <div className="grid lg:grid-cols-5 gap-6 animate-fade-up">
                <Card className="lg:col-span-3 overflow-hidden border-border/40 shadow-sm">
                  <CardContent className="p-0 h-[380px]">
                    <TradeMap
                      exporterCountry={
                        product.topExporters[0]?.country || "Canada"
                      }
                      allExporters={exportersData}
                      tariffRate={tariffRate}
                    />
                  </CardContent>
                </Card>
                <div className="lg:col-span-2">
                  <CanadaImpactPanel
                    data={dashboardData.canadaImpact.canada_impact}
                  />
                </div>
              </div>
            )}

            {activeTab === "analysis" && (
              <div className="space-y-6 animate-fade-up">
                <AdvancedMetricsPanel
                  advanced={dashboardData.advancedMetrics}
                  action={dashboardData.actionMetrics}
                />
                <QualitativeInsightsPanel
                  data={dashboardData.qualitativeData}
                />
              </div>
            )}
          </main>
        ) : (
          <div className="flex-1 flex items-center justify-center p-12 text-muted-foreground animate-pulse">
            Calculating market shift...
          </div>
        )}
      </div>
    </ReactLenis>
  );
}
