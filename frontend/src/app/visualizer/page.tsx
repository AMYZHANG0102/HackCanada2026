"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { products } from "@/lib/products";
import {
  simulateTariff,
  getAlternativeSuppliers,
  TariffSimulationResult,
} from "@/lib/tariff-engine";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import AccessibilityMenu from "@/components/accessibility-menu";
import { Button } from "@/components/ui/button";
import { Settings, Instagram, Linkedin, Twitter, Moon, Sun } from "lucide-react";

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
        <div className="flex items-center gap-2 font-bold tracking-tight">
          <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-foreground" />
          <span className="hidden sm:inline">Maple Margin</span>
        </div>
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
            className="rounded-full bg-background border-border hover:bg-muted shadow-sm"
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <Sun className="h-4 w-4 text-primary" /> : <Moon className="h-4 w-4 text-primary" />}
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
                    <option disabled value="">Exporting country</option>
                    {product.topExporters.map((e) => (
                      <option key={e.country} value={e.country}>
                        {e.flag} {e.country} — {e.sharePercent}% of US imports
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

      {/* ═══════ EMPTY STATE ═══════ */}
      {!product && (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <p className="text-4xl mb-4">🍁</p>
            <h2 className="text-lg font-semibold mb-1">How do US tariffs affect Canada?</h2>
            <p className="text-sm text-muted-foreground">
              Choose a Canadian export sector above to simulate how US tariffs imposed under 2025–2026 legislation ripple through the supply chain — from Canadian producers to US consumers.
            </p>
          </div>
        </div>
      )}

      {/* ═══════ RESULTS ═══════ */}
      {product && result && (
        <main className="flex-1 px-8 py-8 mx-auto w-full max-w-5xl space-y-8 animate-fade-up">

          {/* ── Stat row ── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Import Cost",   val: `+${result.stageImpacts[0]?.priceIncreasePercent ?? 0}%`, p: result.stageImpacts[0]?.priceIncreasePercent ?? 0 },
              { label: "Manufacturing", val: `+${result.stageImpacts[1]?.priceIncreasePercent ?? 0}%`, p: result.stageImpacts[1]?.priceIncreasePercent ?? 0 },
              { label: "Retail Price",  val: `+${result.totalRetailIncrease}%`,  p: result.totalRetailIncrease },
              { label: "Trade Volume",  val: `-${result.tradeVolumeReduction}%`, p: 3, override: "text-impact-mid" },
            ].map((s) => (
              <Card key={s.label} className="shadow-none">
                <CardContent className="p-4 text-center space-y-1.5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
                  <p className={cn("text-2xl font-bold font-mono tabular-nums", s.override ?? impactColor(s.p))}>
                    {s.val}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Canada context callout ── */}
          {"canadaContext" in product && (
            <div className="flex gap-3 rounded-xl bg-[oklch(0.88_0.06_152/0.4)] border border-[oklch(0.72_0.08_152/0.5)] px-4 py-3">
              <span className="text-lg shrink-0">🍁</span>
              <p className="text-sm text-foreground/85 leading-relaxed">
                {(product as typeof product & { canadaContext: string }).canadaContext}
              </p>
            </div>
          )}

          {/* ── Trade Map ── */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Trade Flow Map
            </h3>
            <Card className="shadow-none overflow-hidden">
              <CardContent className="p-0">
                <TradeMap
                  exporterCountry={country}
                  allExporters={product.topExporters}
                  tariffRate={tariffRate}
                />
              </CardContent>
            </Card>
          </section>

          {/* ── Two-col: stages + flow ── */}
          <div className="grid gap-10 lg:grid-cols-2">

            {/* Price Impact by Stage */}
            <section className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Price Impact by Stage
              </h3>
              {result.stageImpacts.map((s, i) => (
                <Card key={s.stageName} className={cn("relative overflow-hidden shadow-none border", impactBg(s.priceIncreasePercent))}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/80 text-[10px] font-bold text-foreground border border-border/30">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold leading-snug">{s.stageName}</p>
                        <p className="text-[11px] text-muted-foreground">{s.description}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className={cn("text-xl font-bold font-mono tabular-nums", impactColor(s.priceIncreasePercent))}>
                        +{s.priceIncreasePercent}%
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">+${s.absoluteIncrease.toLocaleString()}</p>
                    </div>
                  </CardContent>
                  <div className="px-4 pb-4">
                    <div className="w-full h-1.5 rounded-full bg-black/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(s.priceIncreasePercent * 8, 100)}%`, backgroundColor: impactBarColor(s.priceIncreasePercent) }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </section>

            {/* Supply Chain Flow */}
            <section className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Supply Chain Flow
              </h3>
              <div className="flex flex-col items-center">
                <Card className="w-full shadow-none">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{result.countryExporter?.flag || "🌍"}</span>
                      <div>
                        <p className="text-sm font-semibold">{country} Export</p>
                        <p className="text-[11px] text-muted-foreground">{result.countryExporter?.sharePercent || 0}% of imports</p>
                      </div>
                    </div>
                    {tariffRate > 0 && (
                      <Badge variant="outline" className="font-mono text-[10px] bg-impact-high/8 border-impact-high/25 text-impact-high">
                        +{tariffRate}% tariff
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                {result.stageImpacts.map((s) => (
                  <div key={s.stageName} className="flex flex-col items-center w-full">
                    <div className={cn("w-px h-6", tariffRate > 0 ? connectorCls(s.priceIncreasePercent) : "bg-border")} />
                    <Card className="w-full shadow-none">
                      <CardContent className="flex items-center justify-between p-3 px-4">
                        <p className="text-sm">{s.stageName}</p>
                        <p className={cn("text-sm font-semibold font-mono", tariffRate > 0 ? impactColor(s.priceIncreasePercent) : "text-muted-foreground")}>
                          {tariffRate > 0 ? `+${s.priceIncreasePercent}%` : "—"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}

                <div className={cn("w-px h-6", tariffRate > 0 ? "flow-connector" : "bg-border")} />
                <Card className="w-full shadow-none bg-sage/40 border-sage-dark/50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🛒</span>
                      <div>
                        <p className="text-sm font-semibold">Consumer</p>
                        <p className="text-[11px] text-muted-foreground">End price</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold font-mono tabular-nums">${result.newBasePrice.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>

          {/* ── Alternative Suppliers ── */}
          {tariffRate > 0 && alts.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Alternative Suppliers</h3>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {alts.map((a, i) => (
                  <Card key={a.country} className="shadow-none hover:border-sage-dark/60 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{a.flag}</span>
                          <span className="font-semibold text-sm">{a.country}</span>
                        </div>
                        {i === 0 && (
                          <Badge variant="outline" className="text-[9px] bg-sage/60 border-sage-dark text-ink">Best</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-center">
                        {[
                          { l: "Tariff", v: `${a.currentTariff}%` },
                          { l: "Saves",  v: `-${a.tariffDifference}%` },
                          { l: "Share",  v: `${a.currentShare}%` },
                        ].map((x) => (
                          <div key={x.l}>
                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{x.l}</p>
                            <p className="text-sm font-semibold font-mono text-impact-low">{x.v}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </main>
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
