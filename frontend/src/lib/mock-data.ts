export interface SummaryData {
  total_trade_change_percent: number;
  total_price_change_percent: number;
  top_affected_industries: string[];
}

export const summaryData: SummaryData = {
  "total_trade_change_percent": -2.3,
  "total_price_change_percent": 4.1,
  "top_affected_industries": ["Electronics", "Cars", "Lumber"]
};

export interface PriceEffect {
  industry: string;
  country: string;
  price_change_percent: number;
}

export const priceEffectsData: { price_effects: PriceEffect[] } = {
  "price_effects": [
    {"industry": "electronics", "country": "Canada", "price_change_percent": 12},
    {"industry": "cars", "country": "Canada", "price_change_percent": 3.5},
    {"industry": "lumber", "country": "Canada", "price_change_percent": 5}
  ]
};

export interface CanadaImpact {
  sector: string;
  export_change_percent?: number;
  production_change_percent?: number;
  export_value: number;
}

export const canadaImpactData: { canada_impact: CanadaImpact[] } = {
  "canada_impact": [
    {"sector": "Lumber", "export_change_percent": 5, "export_value": 21000000000},
    {"sector": "Automobile", "production_change_percent": -2, "export_value": 45000000000},
    {"sector": "Agriculture", "export_change_percent": 3, "export_value": 12000000000}
  ]
};

export interface TradeChange {
  exporter: string;
  importer: string;
  product: string;
  change_percent: number;
}

export const tradeChangesData: { trade_changes: TradeChange[] } = {
  "trade_changes": [
    {"exporter": "China", "importer": "Canada", "product": "electronics", "change_percent": -15},
    {"exporter": "Vietnam", "importer": "Canada", "product": "electronics", "change_percent": +8},
    {"exporter": "Mexico", "importer": "Canada", "product": "electronics", "change_percent": +7}
  ]
};
