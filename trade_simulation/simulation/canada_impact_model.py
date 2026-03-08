"""
Canada Impact Model Module

Responsibilities:
- Model Canada-specific tariff scenarios and impacts
- Calculate exposure of Canadian industries to tariffs
- Model bilateral tariff scenarios (e.g., Canada-USA relations)
- Aggregate impacts on Canadian economy (sectors, regions, GDP)
"""

import pandas as pd
import os
from typing import List, Dict, Optional

# Global cache for dependency data
_dependency_data_cache = None


def load_industry_dependencies(filepath: str) -> pd.DataFrame:
    """
    Load and validate industry dependency data from CSV file.
    
    Schema:
        input_industry, dependent_industry, dependency_weight
    
    Example rows:
        steel,cars,0.35
        electronics,computers,0.60
        lumber,construction,0.50
    
    Args:
        filepath: Path to industry_dependencies.csv
    
    Returns:
        Validated pandas DataFrame with dependency relationships
    
    Raises:
        FileNotFoundError: If file does not exist
        ValueError: If schema validation fails
    """
    global _dependency_data_cache
    
    # Check if file exists
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Dependency data file not found: {filepath}")
    
    # Load CSV
    try:
        df = pd.read_csv(filepath)
    except Exception as e:
        raise ValueError(f"Failed to read CSV file: {str(e)}")
    
    # Validate schema
    required_columns = {'input_industry', 'dependent_industry', 'dependency_weight'}
    missing_columns = required_columns - set(df.columns)
    
    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}. "
            f"Found columns: {set(df.columns)}"
        )
    
    # Convert dependency_weight to numeric
    try:
        df['dependency_weight'] = pd.to_numeric(df['dependency_weight'], errors='coerce')
    except Exception as e:
        raise ValueError(f"Failed to convert dependency_weight to numeric: {str(e)}")
    
    # Check for NaN values
    if df['dependency_weight'].isna().any():
        nan_rows = df[df['dependency_weight'].isna()]
        raise ValueError(
            f"Found non-numeric values in dependency_weight column:\n{nan_rows}"
        )
    
    # Strip whitespace from string columns
    for col in ['input_industry', 'dependent_industry']:
        df[col] = df[col].str.strip()
    
    # Validate dependency weights are between 0 and 1
    invalid_weights = df[(df['dependency_weight'] < 0) | (df['dependency_weight'] > 1)]
    if not invalid_weights.empty:
        raise ValueError(
            f"Dependency weights must be between 0 and 1:\n{invalid_weights}"
        )
    
    # Cache the data
    _dependency_data_cache = df.copy()
    
    print(f"✓ Loaded {len(df)} industry dependency relationships")
    print(f"  Input industries: {df['input_industry'].nunique()} unique")
    print(f"  Dependent industries: {df['dependent_industry'].nunique()} unique")
    
    return df


def calculate_ripple_effect(industry: str, price_increase_percent: float) -> List[Dict]:
    """
    Calculate cascading price increases through supply chain dependencies.
    
    When an input industry's prices increase (e.g., due to tariffs on imports),
    industries that depend on it experience cost increases proportional to their
    dependency weight. This models the "ripple effect" through the supply chain.
    
    Formula for each dependent industry:
        dependent_price_increase = price_increase_percent * dependency_weight
    
    Args:
        industry: Input industry name (e.g., 'steel', 'electronics')
        price_increase_percent: Price increase in the input industry (%)
    
    Returns:
        List of dictionaries:
            - industry: Name of dependent industry
            - price_increase: Price increase in that industry (%)
            - dependency_weight: Strength of the dependency (0-1)
    
    Raises:
        RuntimeError: If dependency data not loaded
        ValueError: If industry not found or price_increase_percent is negative
        TypeError: If price_increase_percent is not numeric
    
    Example:
        >>> calculate_ripple_effect("steel", 10)
        [
            {"industry": "cars", "price_increase": 3.5, "dependency_weight": 0.35},
            {"industry": "construction", "price_increase": 5.0, "dependency_weight": 0.50}
        ]
        
        Explanation:
        - Steel price increase: 10%
        - Cars depend on steel with weight 0.35 → 10 × 0.35 = 3.5% price increase
        - Construction depends on steel with weight 0.50 → 10 × 0.50 = 5% price increase
    """
    # Check if data is loaded
    if _dependency_data_cache is None:
        raise RuntimeError(
            "Dependency data not loaded. Call load_industry_dependencies() first."
        )
    
    # Input validation
    try:
        price_increase_percent = float(price_increase_percent)
    except (TypeError, ValueError):
        raise TypeError(
            f"price_increase_percent must be numeric, got {type(price_increase_percent).__name__}"
        )
    
    if price_increase_percent < 0:
        raise ValueError(
            f"price_increase_percent must be non-negative, got {price_increase_percent}"
        )
    
    # Case-insensitive industry lookup
    industry_lower = industry.lower().strip()
    
    # Find all industries that depend on the input industry
    df = _dependency_data_cache
    dependencies = df[df['input_industry'].str.lower() == industry_lower]
    
    if dependencies.empty:
        return []
    
    # Calculate ripple effects
    results = []
    for _, row in dependencies.iterrows():
        dependent_price_increase = price_increase_percent * row['dependency_weight']
        
        results.append({
            "industry": row['dependent_industry'],
            "price_increase": dependent_price_increase,
            "dependency_weight": row['dependency_weight']
        })
    
    # Sort by price increase (descending) for readability
    results.sort(key=lambda x: x['price_increase'], reverse=True)
    
    return results


def get_all_dependencies(industry: str) -> List[Dict]:
    """
    Get all dependency relationships for an industry (as input or dependent).
    
    Args:
        industry: Industry name
    
    Returns:
        List of all dependency relationships involving this industry
    """
    if _dependency_data_cache is None:
        raise RuntimeError(
            "Dependency data not loaded. Call load_industry_dependencies() first."
        )
    
    industry_lower = industry.lower().strip()
    df = _dependency_data_cache
    
    # Find rows where industry is either input or dependent
    as_input = df[df['input_industry'].str.lower() == industry_lower]
    as_dependent = df[df['dependent_industry'].str.lower() == industry_lower]
    
    results = []
    
    # Industries that depend on this one
    if not as_input.empty:
        results.append({
            "relationship": "supplies",
            "dependencies": as_input[['dependent_industry', 'dependency_weight']].to_dict('records')
        })
    
    # Industries that this one depends on
    if not as_dependent.empty:
        results.append({
            "relationship": "depends_on",
            "dependencies": as_dependent[['input_industry', 'dependency_weight']].to_dict('records')
        })
    
    return results


# Canadian sector competitiveness and comparative advantage mapping
CANADIAN_SECTOR_ADVANTAGES = {
    "lumber": {
        "sectors": ["Lumber", "Forest Products", "Wood Products"],
        "competitiveness": 0.80,  # Canada has major comparative advantage
        "trade_gain_factor": 0.55,  # Can capture 55% of lost tariffed Chinese trade
        "description": "Canada is world's largest lumber exporter"
    },
    "agriculture": {
        "sectors": ["Agriculture", "Grains", "Crops", "Canola"],
        "competitiveness": 0.65,
        "trade_gain_factor": 0.40,  # Competes with USA, Brazil, Argentina
        "description": "Strong commodity exporter but faces competition"
    },
    "cars": {
        "sectors": ["Automobiles", "Auto Parts", "Vehicles"],
        "competitiveness": 0.60,
        "trade_gain_factor": 0.15,  # Mexico is stronger competitor in NA
        "description": "Integrated North American auto industry"
    },
    "steel": {
        "sectors": ["Steel", "Iron", "Metals", "Metal Products"],
        "competitiveness": 0.55,
        "trade_gain_factor": 0.35,  # Faces competition from South Korea, India, Brazil
        "description": "Regional producer with tariff protection potential"
    },
    "oil_gas": {
        "sectors": ["Oil & Gas", "Energy", "Petrochemicals"],
        "competitiveness": 0.75,
        "trade_gain_factor": 0.45,  # Geographic proximity to USA market
        "description": "Major energy exporter with geographic advantage"
    },
    "mining": {
        "sectors": ["Mining", "Minerals", "Copper", "Nickel"],
        "competitiveness": 0.70,
        "trade_gain_factor": 0.50,  # Global demand for minerals
        "description": "Significant mining sector with diverse products"
    },
    "electronics": {
        "sectors": ["Electronics", "Tech Manufacturing"],
        "competitiveness": 0.25,
        "trade_gain_factor": 0.05,  # China/Vietnam/Taiwan dominate
        "description": "Limited manufacturing base in Canada"
    },
    "chemicals": {
        "sectors": ["Chemicals", "Pharmaceuticals", "Petrochemicals"],
        "competitiveness": 0.50,
        "trade_gain_factor": 0.25,  # Moderate competition from Germany, China
        "description": "Quality reputation but competing on volume"
    },
    "machinery": {
        "sectors": ["Machinery", "Equipment", "Industrial Equipment"],
        "competitiveness": 0.45,
        "trade_gain_factor": 0.20,  # Germany/Japan dominate
        "description": "Some niche manufacturing excellence"
    }
}


def calculate_canada_impact(product: str, trade_shifts: Dict) -> Dict:
    """
    Calculate the impact of tariff-induced trade shifts on Canadian industries.
    
    When tariffs disrupt trade from typical suppliers (e.g., China, Vietnam),
    Canadian industries may capture a portion of that trade based on their
    competitive advantages and production capacity.
    
    This uses a heuristic model based on Canada's comparative advantages:
    - Lumber: High competitiveness (world's largest exporter)
    - Oil & Gas: High competitiveness (geographic advantage)
    - Mining: Strong position in minerals and metals
    - Agriculture: Competitive but faces regional competition
    - Steel: Regional producer with tariff-driven advantages
    - Autos: Integrated continental supply chain (Mexico competes)
    - Chemicals: Quality producer with moderate competition
    
    Args:
        product: Product category (e.g., 'lumber', 'cars', 'electronics')
        trade_shifts: Dictionary containing:
            - "lost_trade_value": Original tariffed trade value (USD)
            - "trade_loss_percent": Percent reduction in trade (%)
            - "original_supplier": Country losing trade (e.g., 'China')
            - "destination": Importing country (e.g., 'USA')
            - Optional: "tariff_percent": The tariff rate applied
    
    Returns:
        Dictionary with structure:
        {
            "product": str,
            "scenario": dict,
            "canada_impact": [
                {
                    "sector": str,
                    "export_change_percent": float,
                    "trade_value_gain": float,
                    "competitiveness": float,
                    "notes": str
                },
                ...
            ],
            "total_trade_gain": float,
            "economic_assessment": str
        }
    
    Raises:
        ValueError: If product not found in sector mapping
        TypeError: If trade_shifts is not a dictionary
    
    Example:
        >>> result = calculate_canada_impact("lumber", {
        ...     "lost_trade_value": 18_000_000_000,
        ...     "trade_loss_percent": 15,
        ...     "original_supplier": "China",
        ...     "destination": "USA"
        ... })
        >>> result['canada_impact'][0]
        {
            'sector': 'Lumber',
            'export_change_percent': 8.25,  # 15% × 0.55 (trade gain factor)
            'trade_value_gain': 1485000000,  # $1.485B
            'competitiveness': 0.80,
            'notes': 'Canada is world's largest lumber exporter'
        }
    """
    # Input validation
    if not isinstance(trade_shifts, dict):
        raise TypeError(f"trade_shifts must be a dictionary, got {type(trade_shifts).__name__}")
    
    product_lower = product.lower().strip()
    if product_lower not in CANADIAN_SECTOR_ADVANTAGES:
        available = ", ".join(sorted(CANADIAN_SECTOR_ADVANTAGES.keys()))
        raise ValueError(
            f"Product '{product}' not found. Available products: {available}"
        )
    
    # Extract parameters
    lost_trade = trade_shifts.get("lost_trade_value", 0)
    trade_loss_pct = trade_shifts.get("trade_loss_percent", 0)
    original_supplier = trade_shifts.get("original_supplier", "Unknown")
    destination = trade_shifts.get("destination", "Unknown")
    
    # Get Canadian advantage data
    advantage_data = CANADIAN_SECTOR_ADVANTAGES[product_lower]
    
    # Calculate Canada's trade gain
    # Formula: Canadian trade gain = lost_trade_value × trade_gain_factor
    canadian_trade_gain = lost_trade * advantage_data["trade_gain_factor"]
    
    # Calculate export change percent
    # Formula: export_change_percent = trade_loss_percent × trade_gain_factor
    export_change_pct = trade_loss_pct * advantage_data["trade_gain_factor"]
    
    # Build impact results for each Canadian sector
    impacts = []
    for sector in advantage_data["sectors"]:
        impacts.append({
            "sector": sector,
            "export_change_percent": export_change_pct,
            "trade_value_gain": canadian_trade_gain / len(advantage_data["sectors"]),
            "competitiveness": advantage_data["competitiveness"],
            "notes": advantage_data["description"]
        })
    
    # Assess economic significance
    if export_change_pct >= 10:
        assessment = "HIGHLY SIGNIFICANT - Major boost to Canadian exports"
    elif export_change_pct >= 5:
        assessment = "SIGNIFICANT - Noticeable improvement in Canadian competitiveness"
    elif export_change_pct >= 2:
        assessment = "MODERATE - Modest gains for Canadian industries"
    elif export_change_pct > 0:
        assessment = "MINOR - Small positive impact"
    else:
        assessment = "NEUTRAL - No significant impact"
    
    return {
        "product": product,
        "scenario": {
            "lost_trade_value": lost_trade,
            "trade_loss_percent": trade_loss_pct,
            "original_supplier": original_supplier,
            "destination": destination,
            "tariff_percent": trade_shifts.get("tariff_percent", "Unknown")
        },
        "canada_impact": impacts,
        "total_trade_gain": canadian_trade_gain,
        "economic_assessment": assessment
    }


def calculate_canadian_export_impact(tariff_scenario: dict, year: int = 2024) -> dict:
    """
    Calculate impact of tariffs on Canadian exports.
    
    Args:
        tariff_scenario: Dictionary of tariff changes by country/product
        year: Baseline year for analysis
    
    Returns:
        Export impact metrics (value loss, percentage decline by sector)
    """
    pass


def calculate_canadian_import_impact(tariff_scenario: dict) -> dict:
    """
    Calculate impact of tariffs on Canadian imports.
    
    Returns:
        Import cost changes, consumer impacts, sector-specific effects
    """
    pass


def model_bilateral_relationship(partner_country: str, canada_tariffs: dict,
                                partner_tariffs: dict) -> dict:
    """
    Model bilateral tariff relationship (e.g., Canada-USA).
    
    Args:
        partner_country: Trading partner (e.g., 'USA')
        canada_tariffs: Canada's tariff rates on this partner
        partner_tariffs: Partner's tariff rates on Canadian goods
    
    Returns:
        Bilateral trade flow changes and economic impacts
    """
    pass


def aggregate_canadian_impacts(sector_impacts: dict) -> dict:
    """
    Aggregate sectoral impacts into national-level metrics.
    
    Returns:
        Canada GDP impact, employment impact, inflation rate, etc.
    """
    pass


# Example usage and testing
if __name__ == "__main__":
    import sys
    import json
    
    print("=" * 110)
    print("TradeRipple: Canada Impact Model - Examples and Tests")
    print("=" * 110)
    
    try:
        # 1. Load dependency data
        print("\n[1] Loading Industry Dependency Data")
        print("-" * 110)
        
        data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "trade_simulation", "data")
        dep_file = os.path.join(data_dir, "industry_dependencies.csv")
        
        dep_df = load_industry_dependencies(dep_file)
        print(f"✓ Loaded {len(dep_df)} industry relationships")
        
        # 2. User's exact example: Lumber - HIGH advantage for Canada
        print("\n[2] Lumber Sector: HIGH Competitive Advantage for Canada")
        print("-" * 110)
        
        lumber_scenario = {
            "lost_trade_value": 18_000_000_000,  # $18B from China tariffs
            "trade_loss_percent": 15,
            "original_supplier": "China",
            "destination": "USA",
            "tariff_percent": 25
        }
        
        print(f"  Scenario: 25% tariff on Chinese lumber → $18B lost trade")
        lumber_result = calculate_canada_impact("lumber", lumber_scenario)
        
        print(f"\n  Economic Assessment: {lumber_result['economic_assessment']}")
        print(f"  Canadian Trade Gain: ${lumber_result['total_trade_gain']:,.0f}")
        print(f"\n  Impact by Sector:")
        for impact in lumber_result['canada_impact']:
            print(f"    • {impact['sector']:<20} Export gain: {impact['export_change_percent']:>6.2f}%")
            print(f"      Competitiveness: {impact['competitiveness']:.0%} | Trade value: ${impact['trade_value_gain']:,.0f}")
        
        # 3. Automobiles - MODERATE advantage (Mexico competes)
        print("\n[3] Automobiles Sector: MODERATE Competitive Challenge for Canada")
        print("-" * 110)
        
        auto_scenario = {
            "lost_trade_value": 12_500_000_000,  # $12.5B
            "trade_loss_percent": 10,
            "original_supplier": "China/Vietnam",
            "destination": "USA",
            "tariff_percent": 20
        }
        
        print(f"  Scenario: 20% tariff on Chinese autos → $12.5B lost trade")
        auto_result = calculate_canada_impact("cars", auto_scenario)
        
        print(f"  Economic Assessment: {auto_result['economic_assessment']}")
        print(f"  Canadian Trade Gain: ${auto_result['total_trade_gain']:,.0f}")
        print(f"  Note: Mexico is stronger competitor in North American auto supply chain")
        
        # 4. Telecommunications/Electronics - LOW advantage
        print("\n[4] Electronics Sector: LIMITED Competitive Advantage for Canada")
        print("-" * 110)
        
        elec_scenario = {
            "lost_trade_value": 45_000_000_000,  # $45B from major tariffs
            "trade_loss_percent": 20,
            "original_supplier": "China/Vietnam/Taiwan",
            "destination": "USA",
            "tariff_percent": 35
        }
        
        print(f"  Scenario: 35% tariff on electronics → $45B lost trade")
        elec_result = calculate_canada_impact("electronics", elec_scenario)
        
        print(f"  Economic Assessment: {elec_result['economic_assessment']}")
        print(f"  Canadian Trade Gain: ${elec_result['total_trade_gain']:,.0f}")
        print(f"  Note: Taiwan, South Korea dominate semiconductor manufacturing")
        
        # 5. Oil & Gas - STRONG advantage 
        print("\n[5] Oil & Gas Sector: STRONG Competitive Advantage for Canada")
        print("-" * 110)
        
        og_scenario = {
            "lost_trade_value": 35_000_000_000,  # $35B in energy
            "trade_loss_percent": 12,
            "original_supplier": "Saudi Arabia/Russia",
            "destination": "USA",
            "tariff_percent": 20
        }
        
        print(f"  Scenario: 20% tariff on foreign energy → $35B lost trade")
        og_result = calculate_canada_impact("oil_gas", og_scenario)
        
        print(f"  Economic Assessment: {og_result['economic_assessment']}")
        print(f"  Canadian Trade Gain: ${og_result['total_trade_gain']:,.0f}")
        print(f"  Note: Geographic proximity to US provides major advantage")
        
        # 6. Agriculture - COMPETITIVE
        print("\n[6] Agriculture Sector: COMPETITIVE Advantage for Canada")
        print("-" * 110)
        
        ag_scenario = {
            "lost_trade_value": 25_000_000_000,  # $25B
            "trade_loss_percent": 18,
            "original_supplier": "China/Brazil",
            "destination": "USA/Global",
            "tariff_percent": 25
        }
        
        print(f"  Scenario: 25% tariff on agricultural imports → $25B lost trade")
        ag_result = calculate_canada_impact("agriculture", ag_scenario)
        
        print(f"  Economic Assessment: {ag_result['economic_assessment']}")
        print(f"  Canadian Trade Gain: ${ag_result['total_trade_gain']:,.0f}")
        print(f"  Note: Faces strong competition from Brazil, Argentina")
        
        # 7. Steel - MODERATE TO STRONG advantage
        print("\n[7] Steel Sector: MODERATE Competitive Advantage for Canada")
        print("-" * 110)
        
        steel_scenario = {
            "lost_trade_value": 8_000_000_000,  # $8B
            "trade_loss_percent": 20,
            "original_supplier": "China",
            "destination": "USA/NA",
            "tariff_percent": 25
        }
        
        print(f"  Scenario: 25% tariff on Chinese steel → $8B lost trade")
        steel_result = calculate_canada_impact("steel", steel_scenario)
        
        print(f"  Economic Assessment: {steel_result['economic_assessment']}")
        print(f"  Canadian Trade Gain: ${steel_result['total_trade_gain']:,.0f}")
        
        # 8. Mining - STRONG advantage
        print("\n[8] Mining Sector: STRONG Competitive Advantage for Canada")
        print("-" * 110)
        
        mining_scenario = {
            "lost_trade_value": 22_000_000_000,  # $22B minerals
            "trade_loss_percent": 16,
            "original_supplier": "China/Peru",
            "destination": "Global",
            "tariff_percent": 30
        }
        
        print(f"  Scenario: 30% tariff on mineral imports → $22B lost trade")
        mining_result = calculate_canada_impact("mining", mining_scenario)
        
        print(f"  Economic Assessment: {mining_result['economic_assessment']}")
        print(f"  Canadian Trade Gain: ${mining_result['total_trade_gain']:,.0f}")
        
        # 9. Comparative advantage summary
        print("\n[9] COMPARATIVE ADVANTAGE SUMMARY: Canada's Position by Sector")
        print("-" * 110)
        
        print(f"\n{'Sector':<20} {'Competitiveness':<20} {'Trade Gain Factor':<20} {'Assessment':<35}")
        print("-" * 95)
        
        for product, data in sorted(CANADIAN_SECTOR_ADVANTAGES.items()):
            competitiveness_pct = f"{data['competitiveness']:.0%}"
            gain_factor_pct = f"{data['trade_gain_factor']:.0%}"
            
            if data['competitiveness'] >= 0.70:
                rating = "STRONG ADVANTAGE"
            elif data['competitiveness'] >= 0.55:
                rating = "MODERATE ADVANTAGE"
            elif data['competitiveness'] >= 0.40:
                rating = "WEAK ADVANTAGE"
            else:
                rating = "LIMITED ADVANTAGE"
            
            print(f"{product:<20} {competitiveness_pct:<20} {gain_factor_pct:<20} {rating:<35}")
        
        # 10. Scenario comparison
        print("\n[10] Multi-Scenario Comparison: Total Canadian Trade Gains")
        print("-" * 110)
        
        scenarios = [
            ("lumber", lumber_scenario),
            ("cars", auto_scenario),
            ("electronics", elec_scenario),
            ("oil_gas", og_scenario),
            ("agriculture", ag_scenario),
            ("steel", steel_scenario),
            ("mining", mining_scenario)
        ]
        
        print(f"\n{'Product':<20} {'Lost Trade':<20} {'Canada Gains':<20} {'Gain %':<15} {'Assessment':<30}")
        print("-" * 105)
        
        total_gains = 0
        total_lost = 0
        for product, scenario in scenarios:
            result = calculate_canada_impact(product, scenario)
            lost = scenario['lost_trade_value']
            gains = result['total_trade_gain']
            gain_pct = (gains / lost * 100) if lost > 0 else 0
            assessment = result['economic_assessment'].split(" - ")[0]
            
            print(f"{product:<20} ${lost/1e9:>6.1f}B{'':<10} ${gains/1e9:>6.1f}B{'':<10} {gain_pct:>6.2f}%{'':<6} {assessment:<30}")
            total_gains += gains
            total_lost += lost
        
        print("-" * 105)
        overall_capture = (total_gains / total_lost * 100) if total_lost > 0 else 0
        print(f"{'TOTAL':<20} ${total_lost/1e9:>6.1f}B{'':<10} ${total_gains/1e9:>6.1f}B{'':<10} {overall_capture:>6.2f}%")
        
        # 11. Error handling
        print("\n[11] Error Handling Tests")
        print("-" * 110)
        
        # Invalid product
        print("\n  Testing invalid product:")
        try:
            calculate_canada_impact("quantum_computers", lumber_scenario)
        except ValueError as e:
            print(f"    ✓ Caught: {str(e)[:80]}...")
        
        # Invalid trade_shifts type
        print("\n  Testing invalid trade_shifts (not dict):")
        try:
            calculate_canada_impact("lumber", "not_a_dict")
        except TypeError as e:
            print(f"    ✓ Caught: {e}")
        
        # Zero trade loss
        print("\n  Testing zero trade loss:")
        zero_scenario = {
            "lost_trade_value": 0,
            "trade_loss_percent": 0,
            "original_supplier": "None",
            "destination": "None"
        }
        result = calculate_canada_impact("lumber", zero_scenario)
        print(f"    ✓ Result: ${result['total_trade_gain']:,.0f} trade gain (as expected)")
        
        print("\n" + "=" * 110)
        print("✓ All Canada impact model examples completed successfully!")
        print("=" * 110)
        
    except FileNotFoundError as e:
        print(f"✗ Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"✗ Unexpected error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
