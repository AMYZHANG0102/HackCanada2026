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

export interface AdvancedMetrics {
  effective_price_delta: number;
  trade_diversion_score: number;
  supply_chain_fragility: number; // 1-10
  pce_pass_through: number; // percentage of tariff passed to consumer
  input_output_lag_months: number;
  elasticity_of_substitution: number; // rating or decimal
  gov_revenue_impact_billions: number;
}

export interface ActionMetrics {
  alt_sourcing_roi_millions: number;
  net_welfare_effect: string;
}

export interface QualitativeData {
  top_companies: { name: string; exposure: string }[];
  sentiment_score: "Positive" | "Negative" | "Volatile";
  the_why_summary: string;
  substitution_ease: "Easy" | "Moderate" | "Hard";
  job_risk_level: string; // e.g., "High (50k+ jobs)"
}

export interface DashboardData {
  summary: SummaryData;
  priceEffects: { price_effects: PriceEffect[] };
  canadaImpact: { canada_impact: CanadaImpact[] };
  tradeChanges: { trade_changes: TradeChange[] };
  advancedMetrics: AdvancedMetrics;
  actionMetrics: ActionMetrics;
  qualitativeData: QualitativeData;
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

  // --- Mock Generation for New Metrics ---
  const fragility = Math.min(10, Math.max(1, Math.round(5 + (rateFactor * 2))));
  const passThrough = Math.min(100, Math.round(60 + (rateFactor * 10)));
  const lag = Math.max(1, Math.round(6 - (rateFactor * 1.5)));
  
  const altROI = Number((150 * rateFactor).toFixed(1));
  const welfareStr = rateFactor > 1.5 ? "Severe Net Loss" : rateFactor > 1 ? "Moderate Loss" : "Neutral/Slight Gain";
  
  const sentiment = rateFactor > 2 ? "Volatile" : rateFactor > 1 ? "Negative" : "Positive";
  const ease = productName === "Oil & Energy" ? "Hard" : productName === "Video Games" ? "Easy" : "Moderate";

  const topCompaniesMap: Record<string, {name: string, exposure: string}[]> = {
    "Softwood Lumber": [{name: "Canfor", exposure: "High"}, {name: "West Fraser", exposure: "High"}],
    "Steel & Aluminum": [{name: "Stelco", exposure: "Critical"}, {name: "Rio Tinto Alcan", exposure: "High"}],
    "Oil & Energy": [{name: "Suncor", exposure: "Critical"}, {name: "Cenovus", exposure: "High"}],
    "Vehicles & Auto Parts": [{name: "Magna Intl", exposure: "Critical"}, {name: "Linamar", exposure: "High"}],
    "Potash & Fertilizers": [{name: "Nutrien", exposure: "Moderate"}, {name: "Mosaic", exposure: "Low"}],
    "Wheat & Canola": [{name: "Viterra", exposure: "Moderate"}, {name: "Richardson", exposure: "Moderate"}],
    "Electronics & Tech": [{name: "Celestica", exposure: "High"}, {name: "BlackBerry", exposure: "Low"}],
    "Ketchup & Condiments": [{name: "Kraft Heinz Canada", exposure: "Moderate"}, {name: "French's", exposure: "Moderate"}],
    "Video Games": [{name: "Ubisoft Montreal", exposure: "Low"}, {name: "EA Vancouver", exposure: "Low"}],
    "Books & Publishing": [{name: "Indigo", exposure: "High"}, {name: "TC Transcontinental", exposure: "High"}],
  };

  const jobRiskMap: Record<string, string> = {
    "Softwood Lumber": "High (30k+ forestry jobs)",
    "Steel & Aluminum": "Critical (40k+ mill jobs)",
    "Oil & Energy": "Critical (100k+ energy sector jobs)",
    "Vehicles & Auto Parts": "High (125k+ manufacturing jobs)",
  };

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
    },
    advancedMetrics: {
      effective_price_delta: Number((tariffRate * (passThrough / 100)).toFixed(1)),
      trade_diversion_score: Number((15 * rateFactor).toFixed(1)),
      supply_chain_fragility: fragility,
      pce_pass_through: passThrough,
      input_output_lag_months: lag,
      elasticity_of_substitution: Number(Math.max(0.1, 1.2 - (rateFactor * 0.2)).toFixed(2)),
      gov_revenue_impact_billions: Number((2.5 * rateFactor).toFixed(1)),
    },
    actionMetrics: {
      alt_sourcing_roi_millions: altROI,
      net_welfare_effect: welfareStr,
    },
    qualitativeData: {
      top_companies: topCompaniesMap[productName] || [{name: "Generic Corp", exposure: "Moderate"}],
      sentiment_score: sentiment,
      the_why_summary: `High exposure due to ${productName.toLowerCase()} cross-border supply chain integration.`,
      substitution_ease: ease,
      job_risk_level: jobRiskMap[productName] || "Moderate (10k+ jobs)",
    }
  };
}
