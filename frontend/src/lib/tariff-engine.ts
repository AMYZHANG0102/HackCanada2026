import { Product, Exporter } from "./products";

export interface StageImpact {
  stageName: string;
  description: string;
  priceIncreasePercent: number;
  absoluteIncrease: number;
  newPrice: number;
}

export interface TariffSimulationResult {
  product: Product;
  country: string;
  tariffRate: number;
  countryExporter: Exporter | undefined;
  stageImpacts: StageImpact[];
  totalRetailIncrease: number;
  newBasePrice: number;
  tradeVolumeReduction: number;
}

export interface AlternativeSupplier {
  country: string;
  flag: string;
  currentShare: number;
  currentTariff: number;
  tariffDifference: number;
  potentialSavingsPercent: number;
}

/**
 * Simulate tariff impact across the supply chain.
 *
 * Formula per stage:
 *   stageIncrease = tariffRate × importDependency × countryShare × costAbsorption
 *
 * This propagates the tariff through each stage with decreasing impact.
 */
export function simulateTariff(
  product: Product,
  country: string,
  tariffRate: number
): TariffSimulationResult {
  const tariffDecimal = tariffRate / 100;
  const exporter = product.topExporters.find((e) => e.country === country);
  const countryShare = exporter ? exporter.sharePercent / 100 : 0.3;

  const stageImpacts: StageImpact[] = product.supplyChain.map((stage) => {
    const rawIncrease = tariffDecimal * product.importDependency * countryShare * stage.costAbsorption;
    const priceIncreasePercent = Math.round(rawIncrease * 1000) / 10; // one decimal
    const absoluteIncrease = Math.round(product.basePrice * rawIncrease * 100) / 100;
    const newPrice = Math.round((product.basePrice + absoluteIncrease) * 100) / 100;

    return {
      stageName: stage.name,
      description: stage.description,
      priceIncreasePercent,
      absoluteIncrease,
      newPrice,
    };
  });

  // Retail increase = last stage impact
  const totalRetailIncrease =
    stageImpacts.length > 0
      ? stageImpacts[stageImpacts.length - 1].priceIncreasePercent
      : 0;

  const newBasePrice =
    stageImpacts.length > 0
      ? stageImpacts[stageImpacts.length - 1].newPrice
      : product.basePrice;

  // Simple demand elasticity model
  const demandElasticity = -0.6;
  const tradeVolumeReduction = Math.abs(
    Math.round(tariffDecimal * countryShare * demandElasticity * 100 * 10) / 10
  );

  return {
    product,
    country,
    tariffRate,
    countryExporter: exporter,
    stageImpacts,
    totalRetailIncrease,
    newBasePrice,
    tradeVolumeReduction,
  };
}

/**
 * Get alternative suppliers with lower effective tariffs.
 */
export function getAlternativeSuppliers(
  product: Product,
  country: string,
  newTariffRate: number
): AlternativeSupplier[] {
  const currentExporter = product.topExporters.find((e) => e.country === country);
  const effectiveTariff = currentExporter
    ? currentExporter.baseTariff + newTariffRate
    : newTariffRate;

  return product.topExporters
    .filter((e) => e.country !== country)
    .map((alt) => {
      const tariffDifference = Math.round((effectiveTariff - alt.baseTariff) * 10) / 10;
      const potentialSavingsPercent =
        Math.round(
          (tariffDifference / 100) *
            product.importDependency *
            (alt.sharePercent / 100) *
            100 *
            10
        ) / 10;

      return {
        country: alt.country,
        flag: alt.flag,
        currentShare: alt.sharePercent,
        currentTariff: alt.baseTariff,
        tariffDifference,
        potentialSavingsPercent: Math.max(0, potentialSavingsPercent),
      };
    })
    .filter((alt) => alt.tariffDifference > 0)
    .sort((a, b) => b.tariffDifference - a.tariffDifference);
}
