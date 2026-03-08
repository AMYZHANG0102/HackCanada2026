/**
 * Products — Canadian Export Perspective
 *
 * Each product represents a major Canadian export sector.
 * All "sharePercent" values reflect each country's share of US imports for that product.
 * Canada is always listed first (as the primary affected exporter).
 * Tariff rates reflect US-imposed rates as of 2025-2026 trade legislation.
 */

export interface SupplyChainStage {
  name: string;
  description: string;
  costAbsorption: number; // fraction of tariff cost absorbed at this stage
}

export interface Exporter {
  country: string;
  flag: string;
  sharePercent: number;   // share of US imports from this country (%)
  baseTariff: number;     // US-imposed tariff rate on this country's exports (%)
  isoCode?: string;       // ISO 3166-1 numeric, for map highlighting
}

export interface Product {
  id: string;
  name: string;
  icon: string;
  basePrice: number;
  unit: string;
  importDependency: number;  // how import-dependent the US is (0–1)
  description: string;
  canadaContext: string;     // Why this sector matters to Canada
  topExporters: Exporter[];
  supplyChain: SupplyChainStage[];
}

export const products: Product[] = [
  {
    id: "lumber",
    name: "Softwood Lumber",
    icon: "🪵",
    basePrice: 550,
    unit: "per 1,000 board ft",
    importDependency: 0.55,
    description: "Softwood lumber for US residential construction.",
    canadaContext:
      "Canadian lumber is the lifeblood of communities like Prince George, BC and Fredericton, NB. The US countervailing duty (currently ~14.5%) plus additional Trump-era tariffs hit BC's forest towns hardest.",
    topExporters: [
      { country: "Canada",  flag: "🇨🇦", sharePercent: 48, baseTariff: 14.5, isoCode: "124" },
      { country: "Germany", flag: "🇩🇪", sharePercent: 8,  baseTariff: 0,    isoCode: "276" },
      { country: "Sweden",  flag: "🇸🇪", sharePercent: 6,  baseTariff: 0,    isoCode: "752" },
      { country: "Brazil",  flag: "🇧🇷", sharePercent: 5,  baseTariff: 3.2,  isoCode: "076" },
    ],
    supplyChain: [
      { name: "Timber Harvest",         description: "BC, Alberta, Quebec forests",               costAbsorption: 1.0  },
      { name: "Sawmill Processing",      description: "Cutting, drying, grading",                 costAbsorption: 0.35 },
      { name: "Cross-border Shipping",   description: "Rail & truck to US distribution hubs",     costAbsorption: 0.15 },
      { name: "US Retail / Construction",description: "Home framing, renovations, furniture",     costAbsorption: 0.08 },
    ],
  },
  {
    id: "steel_aluminum",
    name: "Steel & Aluminum",
    icon: "🏗️",
    basePrice: 2200,
    unit: "per metric ton",
    importDependency: 0.68,
    description: "Primary metals — steel and aluminum — for US manufacturing.",
    canadaContext:
      "Canada is the #1 supplier of both steel and aluminum to the US. Stelco (Hamilton, ON) and Rio Tinto's Quebec smelters are directly exposed to Section 232 tariffs (25% steel, 10% aluminum). These tariffs were briefly lifted under CUSMA before being reimposed.",
    topExporters: [
      { country: "Canada",      flag: "🇨🇦", sharePercent: 23, baseTariff: 25,  isoCode: "124" },
      { country: "China",       flag: "🇨🇳", sharePercent: 19, baseTariff: 25,  isoCode: "156" },
      { country: "Mexico",      flag: "🇲🇽", sharePercent: 14, baseTariff: 25,  isoCode: "484" },
      { country: "South Korea", flag: "🇰🇷", sharePercent: 9,  baseTariff: 25,  isoCode: "410" },
      { country: "Germany",     flag: "🇩🇪", sharePercent: 7,  baseTariff: 25,  isoCode: "276" },
    ],
    supplyChain: [
      { name: "Primary Production",      description: "Ontario steel mills, Quebec aluminum smelters", costAbsorption: 1.0  },
      { name: "Processing & Finishing",  description: "Rolling, casting, alloy treatment",              costAbsorption: 0.45 },
      { name: "Cross-border Logistics",  description: "Tanker rail & flatbed truck to US plants",       costAbsorption: 0.18 },
      { name: "US Manufacturing",        description: "Auto parts, appliances, construction",           costAbsorption: 0.1  },
    ],
  },
  {
    id: "oil_energy",
    name: "Oil & Energy",
    icon: "🛢️",
    basePrice: 85,
    unit: "per barrel (WTI equiv.)",
    importDependency: 0.95,
    description: "Crude oil & refined energy products piped from Western Canada.",
    canadaContext:
      "Canada supplies ~60% of all US crude oil imports — more than OPEC nations combined. Alberta's oilsands (Suncor, Cenovus) flow via pipeline networks. A 10% tariff on Canadian energy proposed in 2025 would cost Canadian producers ~$15B/year and raise US gasoline prices.",
    topExporters: [
      { country: "Canada",       flag: "🇨🇦", sharePercent: 60, baseTariff: 10,  isoCode: "124" },
      { country: "Mexico",       flag: "🇲🇽", sharePercent: 10, baseTariff: 25,  isoCode: "484" },
      { country: "Saudi Arabia", flag: "🇸🇦", sharePercent: 6,  baseTariff: 0,   isoCode: "682" },
      { country: "Iraq",         flag: "🇮🇶", sharePercent: 4,  baseTariff: 0,   isoCode: "368" },
    ],
    supplyChain: [
      { name: "Extraction (Oilsands)",   description: "Alberta in-situ & mining operations",    costAbsorption: 1.0  },
      { name: "Pipeline Transport",       description: "Keystone, Enbridge Mainline to US",       costAbsorption: 0.3  },
      { name: "US Refinery Processing",  description: "Gulf Coast & Midwest refineries",         costAbsorption: 0.15 },
      { name: "Retail Fuel",             description: "Gas stations, heating oil, jet fuel",     costAbsorption: 0.07 },
    ],
  },
  {
    id: "automobiles",
    name: "Vehicles & Auto Parts",
    icon: "🚗",
    basePrice: 38000,
    unit: "per vehicle",
    importDependency: 0.60,
    description: "Passenger vehicles and components made in Canada under CUSMA.",
    canadaContext:
      "Ontario's auto corridor — Windsor, Oshawa, Alliston — is deeply integrated with US automakers. Stellantis, GM, and Honda Canada plants produce ~1.4M vehicles/year, nearly all exported to the US. A 25% tariff threatens to idle plants and cost 150,000+ Canadian jobs.",
    topExporters: [
      { country: "Canada",  flag: "🇨🇦", sharePercent: 13, baseTariff: 25, isoCode: "124" },
      { country: "Mexico",  flag: "🇲🇽", sharePercent: 28, baseTariff: 25, isoCode: "484" },
      { country: "Japan",   flag: "🇯🇵", sharePercent: 20, baseTariff: 25, isoCode: "392" },
      { country: "Germany", flag: "🇩🇪", sharePercent: 15, baseTariff: 25, isoCode: "276" },
      { country: "South Korea", flag: "🇰🇷", sharePercent: 12, baseTariff: 25, isoCode: "410" },
    ],
    supplyChain: [
      { name: "Parts Manufacturing",       description: "Ontario stamping, casting, electronics",         costAbsorption: 1.0  },
      { name: "Vehicle Assembly",          description: "Windsor (Stellantis), Oshawa (GM), Alliston (Honda)", costAbsorption: 0.5  },
      { name: "Cross-border Delivery",     description: "Truck & rail to US dealership networks",         costAbsorption: 0.2  },
      { name: "US Consumer Purchase",      description: "Dealership sticker price impact",                 costAbsorption: 0.12 },
    ],
  },
  {
    id: "potash",
    name: "Potash & Fertilizers",
    icon: "🌱",
    basePrice: 490,
    unit: "per metric ton",
    importDependency: 0.91,
    description: "Potash fertilizer — essential for US corn, soy, and wheat production.",
    canadaContext:
      "Saskatchewan holds ~30% of the world's recoverable potash reserves. Nutrien (headquartered in Saskatoon) and Mosaic supply over 70% of all US potash imports. Tariffs on this sector ripple into US food prices — a direct but rarely-discussed Canada-US trade leverage point.",
    topExporters: [
      { country: "Canada",  flag: "🇨🇦", sharePercent: 72, baseTariff: 25,  isoCode: "124" },
      { country: "Russia",  flag: "🇷🇺", sharePercent: 10, baseTariff: 35,  isoCode: "643" },
      { country: "Belarus", flag: "🇧🇾", sharePercent: 6,  baseTariff: 35,  isoCode: "112" },
      { country: "Germany", flag: "🇩🇪", sharePercent: 4,  baseTariff: 25,  isoCode: "276" },
    ],
    supplyChain: [
      { name: "Mine Extraction",          description: "Saskatchewan potash mines (Nutrien, Mosaic)", costAbsorption: 1.0  },
      { name: "Processing & Granulation", description: "Milling, compaction, bagging",                costAbsorption: 0.28 },
      { name: "Rail & Port Export",        description: "CN/CP rail to US Midwest distribution",      costAbsorption: 0.12 },
      { name: "Farm Application",          description: "Corn, soy, wheat crop yields affected",      costAbsorption: 0.05 },
    ],
  },
  {
    id: "wheat_canola",
    name: "Wheat & Canola",
    icon: "🌾",
    basePrice: 310,
    unit: "per metric ton",
    importDependency: 0.25,
    description: "Prairie grains & canola oil — staples of Canadian agricultural exports.",
    canadaContext:
      "Canada is the world's largest canola producer and a top-4 wheat exporter. While most Canadian grain goes to non-US markets, the tariff threat pressures the Canadian Wheat Board's negotiating position and affects railway capacity needed for all Canadian exports.",
    topExporters: [
      { country: "Canada",    flag: "🇨🇦", sharePercent: 30, baseTariff: 25, isoCode: "124" },
      { country: "Australia", flag: "🇦🇺", sharePercent: 15, baseTariff: 0,  isoCode: "036" },
      { country: "France",    flag: "🇫🇷", sharePercent: 10, baseTariff: 20, isoCode: "250" },
      { country: "Ukraine",   flag: "🇺🇦", sharePercent: 6,  baseTariff: 1,  isoCode: "804" },
    ],
    supplyChain: [
      { name: "Prairie Harvest",           description: "AB, SK, MB grain farms",                    costAbsorption: 1.0  },
      { name: "Grain Elevator & Milling",  description: "Crushing (canola), milling (wheat)",        costAbsorption: 0.30 },
      { name: "Rail Export (CN/CP)",       description: "Prairie to Vancouver/Thunder Bay ports",     costAbsorption: 0.10 },
      { name: "US Food Production",        description: "Flour, cooking oil, animal feed",            costAbsorption: 0.05 },
    ],
  },
  {
    id: "ketchup",
    name: "Ketchup & Condiments",
    icon: "🍅",
    basePrice: 4.5,
    unit: "per bottle",
    importDependency: 0.15,
    description: "Tomato ketchup and popular table condiments.",
    canadaContext:
      "A classic Canadian trade dispute artifact. Following US tariffs on steel/aluminum, Canada retaliated with tariffs on US ketchup. However, Canada also exports specialized food processing products.",
    topExporters: [
      { country: "Canada", flag: "🇨🇦", sharePercent: 12, baseTariff: 25, isoCode: "124" },
      { country: "Mexico", flag: "🇲🇽", sharePercent: 45, baseTariff: 0, isoCode: "484" },
      { country: "Italy", flag: "🇮🇹", sharePercent: 18, baseTariff: 0, isoCode: "380" },
    ],
    supplyChain: [
      { name: "Tomato Farming", description: "Leamington, ON greenhouses", costAbsorption: 1.0 },
      { name: "Processing & Bottling", description: "Food manufacturing facilities", costAbsorption: 0.4 },
      { name: "Distribution", description: "Grocery supply chains", costAbsorption: 0.15 },
      { name: "US Retail", description: "Supermarkets, restaurants", costAbsorption: 0.05 },
    ],
  },
  {
    id: "video_games",
    name: "Video Games",
    icon: "🎮",
    basePrice: 70,
    unit: "per game unit",
    importDependency: 0.85,
    description: "Digital and physical video game software and development services.",
    canadaContext:
      "Canada (Montreal, Toronto, Vancouver) is a global hub for AAA game development (Ubisoft, EA). Tariffs on digital goods or physical media immediately impact profit margins for top-tier studios.",
    topExporters: [
      { country: "Canada", flag: "🇨🇦", sharePercent: 22, baseTariff: 25, isoCode: "124" },
      { country: "Japan", flag: "🇯🇵", sharePercent: 35, baseTariff: 0, isoCode: "392" },
      { country: "France", flag: "🇫🇷", sharePercent: 15, baseTariff: 0, isoCode: "250" },
      { country: "United Kingdom", flag: "🇬🇧", sharePercent: 10, baseTariff: 0, isoCode: "826" },
    ],
    supplyChain: [
      { name: "Studio Development", description: "Montreal, Vancouver hubs", costAbsorption: 1.0 },
      { name: "Publishing", description: "Global marketing & distribution", costAbsorption: 0.2 },
      { name: "Physical Manufacturing", description: "Disc printing (if applicable)", costAbsorption: 0.05 },
      { name: "US Retail / Digital", description: "Console storefronts, retail chains", costAbsorption: 0.05 },
    ],
  },
  {
    id: "books",
    name: "Books & Publishing",
    icon: "📚",
    basePrice: 20,
    unit: "per book",
    importDependency: 0.35,
    description: "Physical books, magazines, and printed educational materials.",
    canadaContext:
      "Canada has a robust printing and publishing sector that exports finished books and paper products to the US. Tariffs historically impacted uncoated groundwood paper used in US newsprint.",
    topExporters: [
      { country: "Canada", flag: "🇨🇦", sharePercent: 25, baseTariff: 25, isoCode: "124" },
      { country: "China", flag: "🇨🇳", sharePercent: 40, baseTariff: 10, isoCode: "156" },
      { country: "United Kingdom", flag: "🇬🇧", sharePercent: 15, baseTariff: 0, isoCode: "826" },
    ],
    supplyChain: [
      { name: "Pulp & Paper", description: "Quebec & BC mills", costAbsorption: 1.0 },
      { name: "Printing Presses", description: "Commercial book printers", costAbsorption: 0.4 },
      { name: "Logistics", description: "Freight to US warehouses", costAbsorption: 0.15 },
      { name: "US Retailers", description: "Bookstores, Amazon, schools", costAbsorption: 0.05 },
    ],
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getExporterCountries(product: Product): string[] {
  return product.topExporters.map((e) => e.country);
}
