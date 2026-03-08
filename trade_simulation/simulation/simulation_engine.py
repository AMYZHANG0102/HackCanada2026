"""
Simulation Engine Module

Responsibilities:
- Orchestrate the overall simulation workflow
- Chain together tariff, demand, and supply models
- Run iterative simulations to reach equilibrium
- Track and report results from each simulation step
- Handle multiple scenarios and comparative analysis
"""

import sys
import os
from typing import Dict, List, Optional
import json

# Import models from other modules
from tariff_calculator import (
    load_trade_data, 
    get_trade_flow, 
    apply_tariff,
    calculate_tariff_impact
)
from demand_model import calculate_trade_reduction
from supply_shift_model import redistribute_trade
from canada_impact_model import (
    load_industry_dependencies,
    calculate_ripple_effect,
    calculate_canada_impact
)


class SimulationEngine:
    """Main engine coordinating the entire tariff impact simulation."""
    
    def __init__(self, data_dir: str = None):
        """
        Initialize simulation engine with models and data.
        
        Args:
            data_dir: Path to data directory (optional, will auto-detect)
        """
        self.trade_data = None
        self.dependency_data = None
        self.simulation_history = []
        
        # Auto-detect data directory if not provided
        if data_dir is None:
            current_dir = os.path.dirname(__file__)
            data_dir = os.path.join(current_dir, "..", "..", "trade_simulation", "data")
        
        self.data_dir = data_dir
    
    def load_baseline_data(self, year: int = 2024) -> None:
        """
        Load baseline trade flows, tariffs, and economic data.
        
        Args:
            year: Baseline year for simulation
            
        Raises:
            FileNotFoundError: If data files not found
            ValueError: If data validation fails
        """
        trade_file = os.path.join(self.data_dir, "trade_flows.csv")
        dep_file = os.path.join(self.data_dir, "industry_dependencies.csv")
        
        print(f"\n[Engine] Loading baseline data for year {year}...")
        
        try:
            self.trade_data = load_trade_data(trade_file)
            self.dependency_data = load_industry_dependencies(dep_file)
            print(f"[Engine] ✓ Baseline data loaded successfully")
        except Exception as e:
            print(f"[Engine] ✗ Failed to load data: {e}")
            raise
    
    def run_simulation(self, exporter: str, importer: str, product: str, 
                      tariff_percent: float, elasticity: float = 0.6) -> Dict:
        """
        Run complete tariff impact simulation.
        
        Orchestrates:
        1. Load trade data
        2. Apply tariff to affected trade flow
        3. Calculate demand reduction using elasticity
        4. Compute lost trade value
        5. Redistribute trade to alternative suppliers
        6. Calculate supply chain ripple effects
        7. Compute Canada-specific impacts
        
        Args:
            exporter: Country exporting the product (e.g., 'China')
            importer: Country importing the product (e.g., 'USA')
            product: Product category (e.g., 'electronics')
            tariff_percent: Tariff rate as percentage (e.g., 25)
            elasticity: Price elasticity of demand (default 0.6)
        
        Returns:
            Dictionary with comprehensive simulation results including:
                - trade_changes: Bilateral trade impacts
                - price_effects: Tariff and price increase calculations
                - supply_shifts: Trade redistribution to alternatives
                - ripple_effects: Supply chain cascading impacts
                - canada_impact: Benefits/costs for Canadian economy
                - summary: Key metrics overview
        """
        print("\n" + "=" * 100)
        print(f"TradeRipple Simulation: {exporter} → {importer} | {product} | {tariff_percent}% tariff")
        print("=" * 100)
        
        # Ensure data is loaded
        if self.trade_data is None:
            self.load_baseline_data()
        
        # Step 1: Get baseline trade flow
        print(f"\n[Step 1] Loading trade data...")
        trade_value, trade_row = get_trade_flow(exporter, importer, product)
        
        if trade_value is None:
            print(f"[Step 1] ✗ No trade flow found: {exporter} → {importer} ({product})")
            # Create synthetic data for demo purposes
            trade_value = 120_000_000_000  # $120B fallback
            print(f"[Step 1] Using synthetic baseline: ${trade_value:,.0f}")
        else:
            print(f"[Step 1] ✓ Found trade flow: ${trade_value:,.0f}")
        
        # Step 2: Apply tariff impact (calculate new cost)
        print(f"\n[Step 2] Applying tariff ({tariff_percent}%)...")
        tariff_result = apply_tariff(trade_value, tariff_percent)
        print(f"[Step 2] ✓ Tariff cost: ${tariff_result['tariff_amount']:,.0f}")
        print(f"         New import cost: ${tariff_result['new_import_cost']:,.0f}")
        
        # Step 3: Calculate demand reduction (elasticity model)
        print(f"\n[Step 3] Calculating demand reduction (elasticity={elasticity})...")
        demand_result = calculate_trade_reduction(trade_value, tariff_percent, elasticity)
        print(f"[Step 3] ✓ Trade drop: {demand_result['trade_drop_percent']}%")
        print(f"         New trade volume: ${demand_result['new_trade_value']:,.0f}")
        
        # Step 4: Calculate lost trade value
        lost_trade = demand_result['trade_value_loss']
        print(f"\n[Step 4] Computing lost trade...")
        print(f"[Step 4] ✓ Lost trade value: ${lost_trade:,.0f}")
        
        # Step 5: Redistribute to alternative suppliers
        print(f"\n[Step 5] Redistributing trade to alternatives...")
        try:
            trade_shifts = redistribute_trade(product, lost_trade)
            print(f"[Step 5] ✓ Redistributed to {len(trade_shifts)} suppliers")
            for shift in trade_shifts[:3]:  # Show top 3
                print(f"         • {shift['country']}: ${shift['trade_gain']:,.0f}")
        except ValueError as e:
            trade_shifts = []
            print(f"[Step 5] ⚠ Could not redistribute: {e}")
        
        # Step 6: Calculate ripple effects
        print(f"\n[Step 6] Computing supply chain ripple effects...")
        try:
            ripples = calculate_ripple_effect(product, tariff_percent)
            print(f"[Step 6] ✓ Found {len(ripples)} upstream industries affected")
            for ripple in ripples[:3]:  # Show top 3
                print(f"         • {ripple['industry']}: +{ripple['price_increase']:.2f}% cost increase")
        except RuntimeError:
            ripples = []
            print(f"[Step 6] ⚠ Dependency data not available")
        except ValueError:
            ripples = []
            print(f"[Step 6] ⚠ No ripple effects found")
        
        # Step 7: Calculate Canada impact
        print(f"\n[Step 7] Computing Canada-specific impacts...")
        canada_scenario = {
            "lost_trade_value": lost_trade,
            "trade_loss_percent": demand_result['trade_drop_percent'],
            "original_supplier": exporter,
            "destination": importer,
            "tariff_percent": tariff_percent
        }
        
        try:
            canada_result = calculate_canada_impact(product, canada_scenario)
            print(f"[Step 7] ✓ Canada impact assessment: {canada_result['economic_assessment']}")
            print(f"         Total trade gain for Canada: ${canada_result['total_trade_gain']:,.0f}")
        except ValueError:
            canada_result = {"canada_impact": [], "total_trade_gain": 0, "economic_assessment": "Unknown"}
            print(f"[Step 7] ⚠ Canada impact not available for this product")
        
        # Assemble comprehensive results
        print(f"\n[Summary] Compiling results...")
        results = {
            "simulation_metadata": {
                "exporter": exporter,
                "importer": importer,
                "product": product,
                "tariff_percent": tariff_percent,
                "elasticity": elasticity
            },
            "baseline": {
                "original_trade_value": trade_value,
                "baseline_flows": "Loaded from trade_flows.csv"
            },
            "trade_changes": [
                {
                    "flow": f"{exporter} → {importer}",
                    "product": product,
                    "original_value": trade_value,
                    "new_value": demand_result['new_trade_value'],
                    "value_loss": lost_trade,
                    "percent_change": -demand_result['trade_drop_percent']
                }
            ],
            "price_effects": [
                {
                    "type": "Tariff Impact",
                    "original_value": tariff_result['original_value'],
                    "tariff_amount": tariff_result['tariff_amount'],
                    "new_import_cost": tariff_result['new_import_cost'],
                    "price_increase_percent": tariff_result['price_increase_percent']
                }
            ],
            "supply_shifts": [
                {
                    "country": shift['country'],
                    "trade_gain": shift['trade_gain'],
                    "gain_percent": (shift['trade_gain'] / lost_trade * 100) if lost_trade > 0 else 0
                }
                for shift in trade_shifts
            ],
            "ripple_effects": [
                {
                    "industry": ripple['industry'],
                    "price_increase_percent": ripple['price_increase'],
                    "dependency_weight": ripple['dependency_weight']
                }
                for ripple in ripples
            ],
            "canada_impact": canada_result.get('canada_impact', []),
            "summary": {
                "trade_drop_percent": demand_result['trade_drop_percent'],
                "lost_trade_value": lost_trade,
                "canada_trade_gain": canada_result.get('total_trade_gain', 0),
                "tariff_cost_to_importers": tariff_result['tariff_amount'],
                "suppliers_capturing_trade": len(trade_shifts),
                "industries_experiencing_ripples": len(ripples),
                "economic_assessment": canada_result.get('economic_assessment', 'Unknown')
            }
        }
        
        # Store in history
        self.simulation_history.append(results)
        
        print(f"✓ Simulation complete!")
        print("=" * 100)
        
        return results
    
    def compare_scenarios(self, scenarios: List[Dict]) -> Dict:
        """
        Run multiple scenarios and compare outcomes.
        
        Args:
            scenarios: List of scenario dictionaries, each containing:
                - exporter
                - importer
                - product
                - tariff_percent
        
        Returns:
            Comparative analysis across scenarios
        """
        print("\n" + "=" * 100)
        print("Comparative Scenario Analysis")
        print("=" * 100)
        
        results = []
        
        for idx, scenario in enumerate(scenarios, 1):
            print(f"\n[Scenario {idx}] {scenario.get('name', f'Scenario {idx}')}")
            
            result = self.run_simulation(
                scenario['exporter'],
                scenario['importer'],
                scenario['product'],
                scenario['tariff_percent'],
                scenario.get('elasticity', 0.6)
            )
            
            results.append({
                "scenario_name": scenario.get('name', f'Scenario {idx}'),
                "parameters": scenario,
                "results": result
            })
        
        # Generate comparison summary
        comparison = {
            "scenarios": results,
            "comparative_summary": {
                "total_trade_loss": sum(r['results']['summary']['lost_trade_value'] for r in results),
                "total_canada_gain": sum(r['results']['summary']['canada_trade_gain'] for r in results),
                "num_scenarios": len(results)
            }
        }
        
        return comparison
    
    def export_results(self, results: Dict, format: str = 'json') -> str:
        """
        Export simulation results for API/frontend consumption.
        
        Args:
            results: Simulation results dictionary
            format: Output format ('json', 'csv', etc.)
        
        Returns:
            Serialized results ready for API response
        """
        if format == 'json':
            return json.dumps(results, indent=2, default=str)
        else:
            raise ValueError(f"Unsupported format: {format}")
    
    def get_simulation_history(self) -> List[Dict]:
        """Get all simulations run in this session."""
        return self.simulation_history


# Example usage and testing
if __name__ == "__main__":
    print("TradeRipple Simulation Engine - Initialization Test\n")
    
    try:
        # Initialize engine
        engine = SimulationEngine()
        
        # Load baseline data
        engine.load_baseline_data(year=2024)
        
        # Run single scenario: 25% tariff on Chinese electronics to USA
        print("\n[Test 1] Single Scenario: Electronics Tariff")
        result1 = engine.run_simulation(
            exporter="China",
            importer="USA",
            product="electronics",
            tariff_percent=25,
            elasticity=0.6
        )
        
        print("\nResults summary:")
        print(json.dumps(result1['summary'], indent=2))
        
        # Run second scenario: Lumber tariffs
        print("\n\n[Test 2] Single Scenario: Lumber Tariff")
        result2 = engine.run_simulation(
            exporter="China",
            importer="USA",
            product="lumber",
            tariff_percent=25,
            elasticity=0.6
        )
        
        print("\nResults summary:")
        print(json.dumps(result2['summary'], indent=2))
        
        # Run comparative analysis
        print("\n\n[Test 3] Comparative Scenario Analysis")
        scenarios = [
            {
                "name": "Moderate tariff on electronics",
                "exporter": "China",
                "importer": "USA",
                "product": "electronics",
                "tariff_percent": 15
            },
            {
                "name": "High tariff on electronics",
                "exporter": "China",
                "importer": "USA",
                "product": "electronics",
                "tariff_percent": 35
            }
        ]
        
        comparison = engine.compare_scenarios(scenarios)
        
        print("\n\nComparative Summary:")
        print(f"Total trade loss across scenarios: ${comparison['comparative_summary']['total_trade_loss']:,.0f}")
        print(f"Total Canada gains across scenarios: ${comparison['comparative_summary']['total_canada_gain']:,.0f}")
        
        print("\n✓ All tests completed successfully!")
        
    except Exception as e:
        print(f"✗ Error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
