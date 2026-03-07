"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { products } from "@/lib/products";
import {
  simulateTariff,
  getAlternativeSuppliers,
  TariffSimulationResult,
} from "@/lib/tariff-engine";
import { generateDashboardData } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import AccessibilityMenu from "@/components/accessibility-menu";
import { Button } from "@/components/ui/button";
import { Settings, Instagram, Linkedin, Twitter, Contrast } from "lucide-react";
import { SummaryStats } from "@/components/summary-stats";
import { CanadaImpactPanel } from "@/components/canada-impact-panel";
import { PriceEffectsChart } from "@/components/price-effects-chart";
import { TradeChangesTable } from "@/components/trade-changes-table";

/* Lazy-load the map (uses browser APIs, no SSR) */
const TradeMap = dynamic(
  () => import("@/components/trade-map").then((m) => m.TradeMap),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Loading map…</div> }
);

/* ── impact helpers ── */
const impactColor = (p: number) =>
  p <= 2 ? "text-impact-low" : p <= 5 ? "text-impact-mid" : "text-impact-high";

const impactBg = (p: number) =>
  p <= 2
    ? "bg-impact-low/8 border-impact-low/20"
    : p <= 5
    ? "bg-impact-mid/8 border-impact-mid/20"
    : "bg-impact-high/8 border-impact-high/20";

const impactBarColor = (p: number) =>
  p <= 2 ? "oklch(0.55 0.14 152)" : p <= 5 ? "oklch(0.62 0.14 70)" : "oklch(0.60 0.18 15)";

const connectorCls = (p: number) =>
  p > 5 ? "flow-connector-warm" : "flow-connector";

function LogoMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M19.07 4.93l-2.12 2.12M7.05 16.95l-2.12 2.12" />
    </svg>
  );
}

export default function Home() {
  const [selectedId, setSelectedId] = useState("");
  const [country, setCountry] = useState("");
  const [tariffRate, setTariffRate] = useState(25);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const product = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [selectedId]
  );

  const result: TariffSimulationResult | null = useMemo(
    () => (product && country ? simulateTariff(product, country, tariffRate) : null),
    [product, country, tariffRate]
  );

  const alts = useMemo(
    () =>
      product && country && tariffRate > 0
        ? getAlternativeSuppliers(product, country, tariffRate)
        : [],
    [product, country, tariffRate]
  );

  const dashboardData = useMemo(() => {
    if (!product) return null;
    return generateDashboardData(product.name, country, tariffRate);
  }, [product, country, tariffRate]);

  const handleProduct = useCallback((id: string) => {
    setSelectedId(id);
    const p = products.find((x) => x.id === id);
    if (p) {
      setCountry(p.topExporters[0]?.country || "");
      setTariffRate(25);
      setSearchValue(p.name);
    }
  }, []);

  /* Close settings on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#settings-btn") && !target.closest("#settings-panel")) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* ═══════ HEADER ═══════ */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/90 backdrop-blur-md px-4 sm:px-8 py-3.5">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight hover:opacity-80 transition-opacity">
          <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-foreground" />
          <span className="hidden sm:inline">Maple Margin</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-medium">
          <a href="#" className="hover:text-foreground transition-colors">Products</a>
          <a href="#" className="hover:text-foreground transition-colors">Resources</a>
          <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-2 sm:border-l sm:border-border sm:pl-4 sm:ml-2">
          <AccessibilityMenu />
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-background border-border hover:bg-muted shadow-sm transition-transform hover:scale-105"
            onClick={toggleTheme}
            aria-label="Toggle High Contrast"
            title="Toggle High Contrast"
          >
            <Contrast className={cn("h-4 w-4 text-primary transition-transform duration-300", isDark ? "rotate-90" : "rotate-0")} />
          </Button>
        </div>
      </header>

      {/* ═══════ SEARCH + FILTERS ═══════ */}
      <div className="border-b border-border/50 bg-background/60 px-8 py-5">
        <div className="mx-auto max-w-5xl space-y-4">

          {/* ── Search bar ── */}
          <div className="space-y-1.5">
            <div className="relative max-w-xl">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search a Canadian export sector — 'lumber', 'oil', 'auto parts', 'potash'…"
                className={cn(
                  "w-full h-11 pl-10 pr-16 rounded-xl border border-border bg-card text-sm text-foreground",
                  "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
                )}
              />
              {/* Agentic badge */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/40 bg-muted/40 rounded px-1.5 py-0.5 pointer-events-none select-none">
                AI soon
              </span>
            </div>

            {/* Product presets */}
            <div className="flex flex-wrap gap-2 pt-1">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleProduct(p.id)}
                  className={cn(
                    "flex items-center gap-1.5 h-8 rounded-lg border px-3 text-xs font-medium transition-all",
                    selectedId === p.id
                      ? "bg-ink text-white border-ink"
                      : "bg-card border-border text-foreground hover:border-border/80 hover:bg-sage/40"
                  )}
                >
                  <span>{p.icon}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Filters (shown after product selection) ── */}
          {product && (
            <div className="space-y-2 pt-1 animate-fade-up">

              {/* Row 1: product label + country select */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-sm">
                  <span>{product.icon}</span>
                  <span className="font-semibold">{product.name}</span>
                </div>
                <span className="text-muted-foreground/40 text-sm hidden sm:inline">·</span>

                {/* Country select — % = that country's share of US imports */}
                <div className="relative inline-flex items-center gap-1">
                  <select
                    id="country-filter"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="appearance-none h-9 pl-3 pr-8 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 cursor-pointer hover:border-border/80 transition-colors"
                  >
                    <option disabled value="">Exporting to Canada</option>
                    {product.topExporters.map((e) => (
                      <option key={e.country} value={e.country}>
                        {e.flag} {e.country} — {e.sharePercent}% of Canada imports
                      </option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Row 2: tariff slider (full width on small, inline on large) */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Tariff rate</span>
                <div className="flex items-center gap-3 flex-1 min-w-[200px] max-w-sm h-9 rounded-lg border border-border bg-card px-4">
                  <Slider
                    value={[tariffRate]}
                    onValueChange={(v) => setTariffRate(Array.isArray(v) ? v[0] : v)}
                    min={0} max={100} step={1}
                    className="flex-1"
                  />
                  <span className={cn("text-sm font-bold font-mono tabular-nums min-w-[3.5ch] text-right", impactColor(tariffRate))}>
                    {tariffRate}%
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">
                  Trump tariffs on Canadian goods: 25% (energy: 10%)
                </span>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* ═══════ DASHBOARD CONTENT ═══════ */}
      {product && dashboardData ? (
        <main className="flex-1 px-4 sm:px-8 py-8 mx-auto w-full max-w-6xl space-y-8 animate-fade-up">
          
          {/* 1. Summary Statistics */}
          <section>
            <SummaryStats data={dashboardData.summary} />
          </section>

        {/* 2. Top-Level Overview: Map & Price Effects */}
        <div className="grid lg:grid-cols-2 gap-6">
          <section className="space-y-3 flex flex-col h-full">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Trade Flow Map
            </h3>
            <Card className="shadow-none overflow-hidden flex-1 border border-border">
              <CardContent className="p-0 h-[300px] sm:h-[400px]">
                {/* Simplified Trade Map for Dashboard representation */}
                <TradeMap
                  exporterCountry={country || "China"}
                  allExporters={[
                    { country: "China", baseTariff: 25, sharePercent: 25 },
                    { country: "Vietnam", baseTariff: 5, sharePercent: 12 },
                    { country: "Mexico", baseTariff: 0, sharePercent: 15 }
                  ]}
                  tariffRate={tariffRate}
                />
              </CardContent>
            </Card>
          </section>

          <section className="space-y-3 flex flex-col h-full">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
              Price / Cost Effects
            </h3>
            <div className="flex-1">
              <PriceEffectsChart data={dashboardData.priceEffects.price_effects} />
            </div>
          </section>
        </div>

        {/* 3. Detailed Data Tables & Sector Impacts */}
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <section className="space-y-4">
            <CanadaImpactPanel data={dashboardData.canadaImpact.canada_impact} />
          </section>

          <section className="space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Direct Trade Changes
            </h3>
            <TradeChangesTable data={dashboardData.tradeChanges.trade_changes} />
          </section>
        </div>

      </main>
      ) : (
        <div className="flex-1 flex items-center justify-center min-h-[50vh]">
          <div className="text-center max-w-md animate-fade-up">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
              <span className="text-3xl filter grayscale opacity-60">🍁</span>
            </div>
            <h2 className="text-lg font-semibold mb-2 text-foreground">Awaiting Input Parameters</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Select a Canadian export sector above to generate real-time trade impact models and ripple effects based on current US tariff policies.
            </p>
          </div>
        </div>
      )}

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-border mt-auto w-full bg-card pt-10 pb-10 px-6 sm:px-12 relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-8 text-sm font-medium flex-wrap justify-center">
              <span className="font-bold flex items-center gap-2">
                <Settings className="w-5 h-5 text-foreground" /> Maple Margin
              </span>
              <a href="#" className="hover:text-primary transition-colors">Features</a>
              <a href="#" className="hover:text-primary transition-colors">Learn more</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
              <a href="#" className="hover:text-primary transition-colors">Data Source</a>
            </div>

            <div className="flex items-center gap-4 text-foreground/60">
              <a href="#" className="hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
