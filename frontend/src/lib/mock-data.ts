export interface SummaryData {
  total_trade_change_percent: number;
  total_price_change_percent: number;
  top_affected_industries: string[];
}

export interface PriceEffect {
  industry: string;
  country: string;
  price_change_percent: number;
}

export interface CanadaImpact {
  sector: string;
  export_change_percent?: number;
  production_change_percent?: number;
  export_value: number;
}

export interface TradeChange {
  exporter: string;
  importer: string;
  product: string;
  change_percent: number;
}

export interface DashboardData {
  summary: SummaryData;
  priceEffects: { price_effects: PriceEffect[] };
  canadaImpact: { canada_impact: CanadaImpact[] };
  tradeChanges: { trade_changes: TradeChange[] };
}

export function generateDashboardData(
  productName: string,
  exporter: string,
  tariffRate: number
): DashboardData {
  // Use the tariff rate to proportionally drive the "ripple effects"
  // Assuming a baseline of 25% tariff for the default models
  const rateFactor = tariffRate / 25;

  return {
    summary: {
      total_trade_change_percent: Number((-5.2 * rateFactor).toFixed(1)),
      total_price_change_percent: Number((4.1 * rateFactor).toFixed(1)),
      top_affected_industries: [productName, "Logistics", "Consumer Goods"],
    },
    priceEffects: {
      price_effects: [
        { industry: productName, country: "Canada", price_change_percent: Number((12 * rateFactor).toFixed(1)) },
        { industry: productName, country: "USA", price_change_percent: Number((tariffRate * 0.8).toFixed(1)) },
        { industry: "Logistics", country: "Global", price_change_percent: Number((2.5 * rateFactor).toFixed(1)) }
      ]
    },
    canadaImpact: {
      canada_impact: [
        { sector: productName, export_change_percent: Number((-15 * rateFactor).toFixed(1)), export_value: 21000000000 },
        { sector: "Manufacturing", production_change_percent: Number((-8 * rateFactor).toFixed(1)), export_value: 45000000000 },
        { sector: "Raw Materials", export_change_percent: Number((3 * rateFactor).toFixed(1)), export_value: 12000000000 } // Diverted supply
      ]
    },
    tradeChanges: {
      trade_changes: [
        { exporter: "Canada", importer: "USA", product: productName, change_percent: Number((-tariffRate * 0.9).toFixed(1)) },
        { exporter: exporter || "China", importer: "Canada", product: productName, change_percent: Number((-12 * rateFactor).toFixed(1)) },
        { exporter: "Mexico", importer: "USA", product: productName, change_percent: Number((8 * rateFactor).toFixed(1)) } // Substitution effect
      ]
    }
  };
}
