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

  let related1 = "Manufacturing";
  let related2 = "Consumer Goods";

  switch (productName) {
    case "Softwood Lumber":
      related1 = "Home Construction";
      related2 = "Furniture Mfg";
      break;
    case "Steel & Aluminum":
      related1 = "Auto Manufacturing";
      related2 = "Appliances";
      break;
    case "Oil & Energy":
      related1 = "Transportation";
      related2 = "Plastics & Chemicals";
      break;
    case "Vehicles & Auto Parts":
      related1 = "Dealerships";
      related2 = "Logistics";
      break;
    case "Potash & Fertilizers":
      related1 = "US Agriculture";
      related2 = "Food Production";
      break;
    case "Wheat & Canola":
      related1 = "Baking & Milling";
      related2 = "Restaurants";
      break;
    case "Electronics & Tech":
      related1 = "Computers";
      related2 = "Smartphones";
      break;
    case "Ketchup & Condiments":
      related1 = "Restaurants & Fast Food";
      related2 = "Groceries";
      break;
    case "Video Games":
      related1 = "Entertainment";
      related2 = "Console Hardware";
      break;
    case "Books & Publishing":
      related1 = "Education";
      related2 = "Retail Bookstores";
      break;
  }

  return {
    summary: {
      total_trade_change_percent: Number((-5.2 * rateFactor).toFixed(1)),
      total_price_change_percent: Number((4.1 * rateFactor).toFixed(1)),
      top_affected_industries: [productName, related1, related2],
    },
    priceEffects: {
      price_effects: [
        { industry: productName, country: "Canada", price_change_percent: Number((12 * rateFactor).toFixed(1)) },
        { industry: related1, country: "USA", price_change_percent: Number((tariffRate * 0.4).toFixed(1)) },
        { industry: related2, country: "USA", price_change_percent: Number((tariffRate * 0.25).toFixed(1)) }
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
