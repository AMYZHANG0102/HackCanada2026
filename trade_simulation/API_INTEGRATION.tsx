/**
 * TradeRipple API Integration Hook for React
 * 
 * This hook provides methods to call the TradeRipple Simulation Engine API
 * from a React frontend with proper error handling and loading states.
 * 
 * Usage:
 * const { simulateTariff, compareTariffs, loading, error } = useTradeRippleAPI();
 */

import { useState, useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface TariffScenario {
  exporter_country: string;
  importer_country: string;
  product: string;
  tariff_percent: number;
  elasticity?: number;
}

export interface SimulationResult {
  timestamp: string;
  exporter_country: string;
  importer_country: string;
  product: string;
  tariff_percent: number;
  execution_time_ms: number;
  results: {
    baseline: {
      trade_value_usd: number;
      exporter: string;
      importer: string;
      product: string;
    };
    trade_changes: {
      tariff_cost_usd: number;
      price_increase_percent: number;
      trade_reduction_percent: number;
      new_trade_value_usd: number;
    };
    price_effects: {
      import_price_increase_percent: number;
      consumer_price_impact: string;
    };
    supply_shifts: {
      lost_trade_value_usd: number;
      alternative_suppliers: Array<{
        country: string;
        trade_gain_usd: number;
      }>;
    };
    ripple_effects: Array<{
      affected_industry: string;
      price_increase_percent: number;
      dependency_weight: number;
    }>;
    canada_impact: {
      sector: string;
      competitiveness_rating: number;
      estimated_trade_gain_usd: number;
      sector_benefit: string;
    };
    summary: {
      total_trade_lost: number;
      primary_impact: string;
      secondary_impacts: string[];
    };
  };
}

export interface APIError {
  message: string;
  status?: number;
  details?: string;
}

/**
 * Custom hook for TradeRipple API integration
 */
export const useTradeRippleAPI = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<APIError | null>(null);

  const checkAPIHealth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.status === 200;
    } catch (err) {
      return false;
    }
  }, []);

  /**
   * Simulate a single tariff scenario
   */
  const simulateTariff = useCallback(
    async (scenario: TariffScenario): Promise<SimulationResult | null> => {
      setLoading(true);
      setError(null);

      try {
        // Validate input
        if (!scenario.exporter_country || !scenario.importer_country || !scenario.product) {
          throw new Error('Missing required fields: exporter_country, importer_country, product');
        }

        if (scenario.tariff_percent < 0 || scenario.tariff_percent > 500) {
          throw new Error('tariff_percent must be between 0 and 500');
        }

        const response = await fetch(`${API_BASE_URL}/simulate_tariff`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            exporter_country: scenario.exporter_country.trim(),
            importer_country: scenario.importer_country.trim(),
            product: scenario.product.trim(),
            tariff_percent: scenario.tariff_percent,
            elasticity: scenario.elasticity || 0.6,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.detail || `HTTP ${response.status}`;
          throw new Error(errorMessage);
        }

        const data: SimulationResult = await response.json();
        return data;
      } catch (err) {
        const errorObj: APIError = {
          message: err instanceof Error ? err.message : 'Unknown error',
          details: err instanceof Error ? err.stack : undefined,
        };
        setError(errorObj);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Run multiple tariff simulations in batch
   */
  const simulateBatch = useCallback(
    async (scenarios: TariffScenario[]): Promise<SimulationResult[] | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!scenarios || scenarios.length === 0) {
          throw new Error('At least one scenario is required');
        }

        const response = await fetch(`${API_BASE_URL}/simulate_tariff/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(scenarios),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.detail || `HTTP ${response.status}`;
          throw new Error(errorMessage);
        }

        const data: SimulationResult[] = await response.json();
        return data;
      } catch (err) {
        const errorObj: APIError = {
          message: err instanceof Error ? err.message : 'Unknown error',
        };
        setError(errorObj);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Compare multiple tariff scenarios
   */
  const compareScenarios = useCallback(
    async (scenarios: Array<{ [key: string]: any }>): Promise<any | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/compare`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(scenarios),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (err) {
        const errorObj: APIError = {
          message: err instanceof Error ? err.message : 'Unknown error',
        };
        setError(errorObj);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    simulateTariff,
    simulateBatch,
    compareScenarios,
    checkAPIHealth,
    loading,
    error,
  };
};

/**
 * React Component Example: Tariff Simulator
 * 
 * Usage:
 * <TariffSimulator />
 */
export const TariffSimulatorExample: React.FC = () => {
  const { simulateTariff, loading, error } = useTradeRippleAPI();
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [formData, setFormData] = useState<TariffScenario>({
    exporter_country: 'China',
    importer_country: 'Canada',
    product: 'electronics',
    tariff_percent: 25,
    elasticity: 0.6,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'tariff_percent' || name === 'elasticity' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await simulateTariff(formData);
    if (result) {
      setResult(result);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'Arial' }}>
      <h1>TradeRipple Tariff Simulator</h1>

      <form onSubmit={handleSubmit} style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Exporter Country:
          </label>
          <input
            type="text"
            name="exporter_country"
            value={formData.exporter_country}
            onChange={handleInputChange}
            placeholder="e.g., China"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Importer Country:
          </label>
          <input
            type="text"
            name="importer_country"
            value={formData.importer_country}
            onChange={handleInputChange}
            placeholder="e.g., Canada"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Product:
          </label>
          <input
            type="text"
            name="product"
            value={formData.product}
            onChange={handleInputChange}
            placeholder="e.g., electronics"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Tariff Percent: {formData.tariff_percent}%
          </label>
          <input
            type="range"
            name="tariff_percent"
            value={formData.tariff_percent}
            onChange={handleInputChange}
            min="0"
            max="100"
            style={{ width: '100%' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
          }}
        >
          {loading ? 'Simulating...' : 'Run Simulation'}
        </button>
      </form>

      {error && (
        <div style={{ backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
          <strong>Error:</strong> {error.message}
        </div>
      )}

      {result && (
        <div style={{ backgroundColor: '#d4edda', border: '1px solid #c3e6cb', color: '#155724', padding: '15px', borderRadius: '4px' }}>
          <h2>Simulation Results</h2>
          <p>
            <strong>Scenario:</strong> {result.exporter_country} → {result.importer_country} ({result.product}) @ {result.tariff_percent}%
          </p>
          <p>
            <strong>Execution Time:</strong> {result.execution_time_ms.toFixed(2)}ms
          </p>
          <details>
            <summary>Full Results (JSON)</summary>
            <pre style={{ backgroundColor: '#fff', padding: '10px', overflow: 'auto' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default useTradeRippleAPI;
