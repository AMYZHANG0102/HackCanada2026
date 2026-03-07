"use client";

import { useState, useMemo, useRef } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

/* Country name → ISO numeric code (used by world-atlas topojson) */
const COUNTRY_ISO: Record<string, string> = {
  China: "156",
  Canada: "124",
  Germany: "276",
  "South Korea": "410",
  Japan: "392",
  India: "356",
  Mexico: "484",
  Sweden: "752",
  Brazil: "076",
  Russia: "643",
  Taiwan: "158",
  Vietnam: "704",
  Australia: "036",
  France: "250",
  Ukraine: "804",
  "United States": "840",
};

/* Approximate centroids for arc drawing [lon, lat] */
const COUNTRY_COORDS: Record<string, [number, number]> = {
  China: [104, 35],
  Canada: [-96, 60],
  Germany: [10, 51],
  "South Korea": [128, 36],
  Japan: [138, 36],
  India: [78, 22],
  Mexico: [-102, 24],
  Sweden: [18, 60],
  Brazil: [-51, -10],
  Russia: [100, 60],
  Taiwan: [121, 23],
  Vietnam: [108, 16],
  Australia: [134, -25],
  France: [2, 46],
  Ukraine: [32, 49],
  "United States": [-98, 38],
};

interface TradeMapProps {
  exporterCountry: string;          // selected exporting country
  allExporters: Array<{             // all top exporters for this product
    country: string;
    sharePercent: number;
    baseTariff: number;
  }>;
  tariffRate: number;
}

export function TradeMap({ exporterCountry, allExporters, tariffRate }: TradeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; info: string } | null>(null);

  const importerISO = COUNTRY_ISO["United States"];
  const selectedISO = COUNTRY_ISO[exporterCountry];
  const allExporterISOs = new Set(allExporters.map((e) => COUNTRY_ISO[e.country]).filter(Boolean));

  const exporterMap = useMemo(() => {
    const m: Record<string, (typeof allExporters)[0]> = {};
    for (const e of allExporters) m[e.country] = e;
    return m;
  }, [allExporters]);

  const selectedCoords = COUNTRY_COORDS[exporterCountry];
  const usCoords = COUNTRY_COORDS["United States"];

  const getFill = (id: string) => {
    if (id === selectedISO) return "oklch(0.55 0.14 152)";           // selected exporter — green
    if (id === importerISO) return "oklch(0.62 0.14 230)";           // USA — blue
    if (allExporterISOs.has(id)) return "oklch(0.82 0.08 152)";      // other exporters — light green
    return "oklch(0.91 0.02 152)";                                    // rest of world
  };

  const getHoverFill = (id: string) => {
    if (id === selectedISO) return "oklch(0.48 0.16 152)";
    if (id === importerISO) return "oklch(0.55 0.16 230)";
    if (allExporterISOs.has(id)) return "oklch(0.72 0.1 152)";
    return "oklch(0.85 0.025 152)";
  };

  const getRelativePos = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseEnter = (
    e: React.MouseEvent,
    geoId: string,
    geoName: string
  ) => {
    setHoveredCountry(geoId);
    const exporter = allExporters.find((x) => COUNTRY_ISO[x.country] === geoId);
    const isSelected = geoId === selectedISO;
    const isImporter = geoId === importerISO;

    let info = "";
    if (isImporter) info = "Tariff imposer (USA)";
    else if (isSelected) {
      info = `${exporterMap[exporterCountry]?.sharePercent ?? 0}% of US imports · +${tariffRate}% tariff`;
    } else if (exporter) {
      info = `${exporter.sharePercent}% of US imports · ${exporter.baseTariff}% base tariff`;
    }

    if (info) {
      const pos = getRelativePos(e);
      setTooltip({ x: pos.x, y: pos.y, name: geoName, info });
    }
  };

  const handleMouseLeave = () => {
    setHoveredCountry(null);
    setTooltip(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (tooltip) {
      const pos = getRelativePos(e);
      setTooltip((t) => t ? { ...t, x: pos.x, y: pos.y } : null);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {/* Legend */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 bg-card/90 backdrop-blur-sm rounded-lg border border-border/50 p-2.5 text-[10px]">
        {[
          { color: "oklch(0.55 0.14 152)", label: "Selected exporter" },
          { color: "oklch(0.82 0.08 152)", label: "Other exporters" },
          { color: "oklch(0.62 0.14 230)", label: "Importer (USA)" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: l.color }} />
            <span className="text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Tariff badge */}
      {tariffRate > 0 && (
        <div className="absolute top-3 right-3 z-10 bg-impact-high/10 border border-impact-high/25 rounded-lg px-2.5 py-1.5 text-[11px] font-mono font-semibold text-impact-high">
          +{tariffRate}% tariff on {exporterCountry}
        </div>
      )}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130, center: [10, 20] }}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo) => {
              const id = geo.id as string;
              const isHovered = hoveredCountry === id;
              const isInteractive =
                id === selectedISO || id === importerISO || allExporterISOs.has(id);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isHovered ? getHoverFill(id) : getFill(id)}
                  stroke="oklch(0.95 0.015 152)"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none", transition: "fill 0.15s ease" },
                    hover: { outline: "none", cursor: isInteractive ? "pointer" : "default" },
                    pressed: { outline: "none" },
                  }}
                  onMouseEnter={(e: React.MouseEvent) =>
                    handleMouseEnter(e, id, geo.properties.name)
                  }
                  onMouseLeave={handleMouseLeave}
                />
              );
            })
          }
        </Geographies>

        {/* Arc from exporter → USA */}
        {selectedCoords && usCoords && tariffRate > 0 && (
          <Line
            from={selectedCoords}
            to={usCoords}
            stroke="oklch(0.60 0.18 15)"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray="6,4"
            style={{ opacity: 0.7 }}
          />
        )}

        {/* Markers for all exporters */}
        {allExporters.map((exp) => {
          const coords = COUNTRY_COORDS[exp.country];
          if (!coords) return null;
          const isSelected = exp.country === exporterCountry;
          return (
            <Marker key={exp.country} coordinates={coords}>
              <circle
                r={isSelected ? 5 : 3}
                fill={isSelected ? "oklch(0.55 0.14 152)" : "oklch(0.82 0.08 152)"}
                stroke="white"
                strokeWidth={1.5}
                style={{ transition: "r 0.2s ease" }}
              />
            </Marker>
          );
        })}

        {/* USA marker */}
        {usCoords && (
          <Marker coordinates={usCoords}>
            <circle r={5} fill="oklch(0.62 0.14 230)" stroke="white" strokeWidth={1.5} />
          </Marker>
        )}
      </ComposableMap>

      {/* Tooltip — absolute within container, offset right+up from cursor */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: tooltip.x + 14,
            top: tooltip.y - 8,
            transform: tooltip.x > (containerRef.current?.offsetWidth ?? 999) - 180
              ? "translateX(-110%)"  // flip left if near right edge
              : undefined,
          }}
        >
          <div className="bg-card border border-border shadow-lg rounded-lg px-3 py-2 text-xs whitespace-nowrap">
            <p className="font-semibold">{tooltip.name}</p>
            <p className="text-muted-foreground">{tooltip.info}</p>
          </div>
        </div>
      )}
    </div>
  );
}
