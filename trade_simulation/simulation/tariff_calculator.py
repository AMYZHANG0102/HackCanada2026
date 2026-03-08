"""
Tariff Calculator Module

Responsibilities:
- Parse tariff rates from datasets (WITS_Tariffs, OECD)
- Calculate effective tariff rates on imported goods
- Apply tariffs to trade flows based on country pairs and product codes
- Handle tariff escalation scenarios (gradual increases)
"""

import pandas as pd
import os
from typing import Optional, Tuple

# Global cache for trade data
_trade_data_cache = None


def load_trade_data(filepath: str) -> pd.DataFrame:
    """
    Load and validate trade flows data from CSV file.
    
    Schema validation:
    - Required columns: exporter, importer, product, value_usd
    - value_usd must be numeric
    
    Args:
        filepath: Path to trade_flows.csv file
    
    Returns:
        Validated pandas DataFrame with trade flows
    
    Raises:
        FileNotFoundError: If file does not exist
        ValueError: If schema validation fails
    """
    global _trade_data_cache
    
    # Check if file exists
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Trade data file not found: {filepath}")
    
    # Load CSV
    try:
        df = pd.read_csv(filepath)
    except Exception as e:
        raise ValueError(f"Failed to read CSV file: {str(e)}")
    
    # Validate schema
    required_columns = {'exporter', 'importer', 'product', 'value_usd'}
    missing_columns = required_columns - set(df.columns)
    
    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}. "
            f"Found columns: {set(df.columns)}"
        )
    
    # Convert value_usd to numeric
    try:
        df['value_usd'] = pd.to_numeric(df['value_usd'], errors='coerce')
    except Exception as e:
        raise ValueError(f"Failed to convert value_usd to numeric: {str(e)}")
    
    # Check for any NaN values after conversion
    if df['value_usd'].isna().any():
        nan_rows = df[df['value_usd'].isna()]
        raise ValueError(
            f"Found non-numeric values in value_usd column:\n{nan_rows}"
        )
    
    # Strip whitespace from string columns
    for col in ['exporter', 'importer', 'product']:
        df[col] = df[col].str.strip()
    
    # Cache the data
    _trade_data_cache = df.copy()
    
    print(f"✓ Loaded {len(df)} trade flows from {filepath}")
    print(f"  Countries: {df['exporter'].nunique() + df['importer'].nunique()} unique")
    print(f"  Products: {df['product'].nunique()} unique")
    print(f"  Total trade value: ${df['value_usd'].sum():,.0f}")
    
    return df


def get_trade_flow(exporter: str, importer: str, product: str) -> Tuple[Optional[float], Optional[pd.Series]]:
    """
    Filter trade data by exporter, importer, and product.
    
    Args:
        exporter: Country code or name of exporting country
        importer: Country code or name of importing country
        product: Product name/code
    
    Returns:
        Tuple of (trade_value_usd, full_row_as_series)
        Returns (None, None) if no match found
    """
    if _trade_data_cache is None:
        raise RuntimeError(
            "Trade data not loaded. Call load_trade_data() first."
        )
    
    # Case-insensitive filter
    exporter = exporter.strip()
    importer = importer.strip()
    product = product.strip()
    
    df = _trade_data_cache
    
    filtered = df[
        (df['exporter'].str.lower() == exporter.lower()) &
        (df['importer'].str.lower() == importer.lower()) &
        (df['product'].str.lower() == product.lower())
    ]
    
    if filtered.empty:
        return None, None
    
    if len(filtered) > 1:
        print(f"WARNING: Multiple matches found for {exporter}->{importer} {product}. "
              f"Returning first match.")
    
    row = filtered.iloc[0]
    return row['value_usd'], row


def get_all_trade_flows(exporter: Optional[str] = None, 
                        importer: Optional[str] = None,
                        product: Optional[str] = None) -> pd.DataFrame:
    """
    Get all trade flows matching optional filters.
    
    Args:
        exporter: Filter by exporting country (optional)
        importer: Filter by importing country (optional)
        product: Filter by product (optional)
    
    Returns:
        Filtered DataFrame
    """
    if _trade_data_cache is None:
        raise RuntimeError(
            "Trade data not loaded. Call load_trade_data() first."
        )
    
    df = _trade_data_cache.copy()
    
    if exporter:
        df = df[df['exporter'].str.lower() == exporter.lower()]
    
    if importer:
        df = df[df['importer'].str.lower() == importer.lower()]
    
    if product:
        df = df[df['product'].str.lower() == product.lower()]
    
    return df


def calculate_tariff_impact(trade_value: float, tariff_rate: float) -> float:
    """
    Calculate the cost impact of applying a tariff to a trade value.
    
    Args:
        trade_value: Value of goods being tariffed (USD)
        tariff_rate: Tariff rate as a decimal (e.g., 0.25 for 25%)
    
    Returns:
        Additional cost from tariff
    
    Example:
        >>> calculate_tariff_impact(100_000_000, 0.25)
        25000000.0
    """
    return trade_value * tariff_rate


def apply_tariff(original_trade_value: float, tariff_percent: float) -> dict:
    """
    Calculate the new import cost after applying a tariff.
    
    Tariff increases the import price by the specified percentage.
    Formula: new_import_cost = original_trade_value * (1 + tariff_percent / 100)
    
    Args:
        original_trade_value: Original value of imported goods (USD)
        tariff_percent: Tariff rate as a percentage (e.g., 25 for 25%)
    
    Returns:
        Dictionary with keys:
            - original_value: Original trade value (USD)
            - tariff_percent: Tariff rate (%)
            - tariff_amount: Additional cost due to tariff (USD)
            - new_import_cost: Total import cost after tariff (USD)
            - price_increase_percent: Percentage increase in import price (%)
    
    Raises:
        ValueError: If original_trade_value is negative or tariff_percent is negative
        TypeError: If inputs are not numeric
    
    Example:
        >>> apply_tariff(120_000_000_000, 25)
        {
            'original_value': 120000000000,
            'tariff_percent': 25,
            'tariff_amount': 30000000000,
            'new_import_cost': 150000000000,
            'price_increase_percent': 25.0
        }
    """
    # Input validation
    try:
        original_trade_value = float(original_trade_value)
        tariff_percent = float(tariff_percent)
    except (TypeError, ValueError):
        raise TypeError(
            f"Inputs must be numeric. "
            f"Got original_trade_value={type(original_trade_value).__name__}, "
            f"tariff_percent={type(tariff_percent).__name__}"
        )
    
    # Validate non-negative values
    if original_trade_value < 0:
        raise ValueError(
            f"original_trade_value must be non-negative, got {original_trade_value}"
        )
    
    if tariff_percent < 0:
        raise ValueError(
            f"tariff_percent must be non-negative, got {tariff_percent}"
        )
    
    # Calculate tariff amount and new cost
    tariff_amount = original_trade_value * (tariff_percent / 100)
    new_import_cost = original_trade_value + tariff_amount
    
    # Price increase is the same as tariff_percent for this formula
    price_increase_percent = tariff_percent
    
    return {
        "original_value": original_trade_value,
        "tariff_percent": tariff_percent,
        "tariff_amount": tariff_amount,
        "new_import_cost": new_import_cost,
        "price_increase_percent": price_increase_percent
    }


def load_tariff_data(country_code: str) -> dict:
    """
    Load tariff rates for a specific country.
    
    Args:
        country_code: ISO country code (e.g., 'CAN', 'USA')
    
    Returns:
        Dictionary of product codes mapped to tariff rates
    """
    pass


def apply_bilateral_tariff(exporter: str, importer: str, product: str, tariff_rate: float) -> dict:
    """
    Apply tariff between two specific countries for a product.
    
    Returns:
        Impact metrics (cost increase, price change, etc.)
    """
    pass


# Example usage and testing
if __name__ == "__main__":
    import sys
    import json
    
    # Get the path to the data directory
    data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "trade_simulation", "data")
    trade_file = os.path.join(data_dir, "trade_flows.csv")
    
    print("=" * 80)
    print("TradeRipple: Tariff Calculator Module - Examples and Tests")
    print("=" * 80)
    
    try:
        # 1. Load trade data with validation
        print("\n[1] Loading trade data...")
        trade_df = load_trade_data(trade_file)
        
        print("\nFirst few rows:")
        print(trade_df.head())
        
        # 2. Get a specific trade flow
        print("\n[2] Looking up specific trade flows...")
        
        value, row = get_trade_flow("China", "Canada", "electronics")
        if value is not None:
            print(f"\n✓ Found trade flow:")
            print(f"  {row['exporter']} → {row['importer']}")
            print(f"  Product: {row['product']}")
            print(f"  Value: ${value:,.0f}")
        else:
            print("\n✗ Trade flow not found (expected for demo data)")
        
        # 3. Filter all flows by exporter
        print("\n[3] Filtering by exporter (Canada)...")
        canada_exports = get_all_trade_flows(exporter="Canada")
        print(f"Found {len(canada_exports)} export flows from Canada:")
        print(canada_exports)
        
        # 4. Filter by importer
        print("\n[4] Filtering by importer (USA)...")
        usa_imports = get_all_trade_flows(importer="USA")
        print(f"Found {len(usa_imports)} import flows into USA:")
        print(usa_imports)
        
        # 5. Apply tariff calculations
        print("\n[5] Applying tariff calculations...")
        print("-" * 80)
        
        # Test Case 1: Medium tariff on large trade value (from user example)
        print("\n  Test Case 1: 25% tariff on $120 billion trade")
        result1 = apply_tariff(120_000_000_000, 25)
        print(f"    Original Value:       ${result1['original_value']:,.0f}")
        print(f"    Tariff Percent:       {result1['tariff_percent']}%")
        print(f"    Tariff Amount:        ${result1['tariff_amount']:,.0f}")
        print(f"    New Import Cost:      ${result1['new_import_cost']:,.0f}")
        print(f"    Price Increase:       {result1['price_increase_percent']}%")
        
        # Test Case 2: High tariff
        print("\n  Test Case 2: 50% tariff on $50 billion trade")
        result2 = apply_tariff(50_000_000_000, 50)
        print(f"    Original Value:       ${result2['original_value']:,.0f}")
        print(f"    Tariff Amount:        ${result2['tariff_amount']:,.0f}")
        print(f"    New Import Cost:      ${result2['new_import_cost']:,.0f}")
        print(f"    Price Increase:       {result2['price_increase_percent']}%")
        
        # Test Case 3: Zero tariff (edge case)
        print("\n  Test Case 3: 0% tariff (no tariff)")
        result3 = apply_tariff(100_000_000_000, 0)
        print(f"    Original Value:       ${result3['original_value']:,.0f}")
        print(f"    Tariff Amount:        ${result3['tariff_amount']:,.0f}")
        print(f"    New Import Cost:      ${result3['new_import_cost']:,.0f} (unchanged)")
        
        # Test Case 4: Small tariff on small value
        print("\n  Test Case 4: 10% tariff on $1 million trade")
        result4 = apply_tariff(1_000_000, 10)
        print(f"    Original Value:       ${result4['original_value']:,.0f}")
        print(f"    Tariff Amount:        ${result4['tariff_amount']:,.0f}")
        print(f"    New Import Cost:      ${result4['new_import_cost']:,.0f}")
        
        # 6. Error handling demonstrations
        print("\n[6] Error handling demonstrations...")
        print("-" * 80)
        
        # Test negative tariff
        print("\n  Testing negative tariff (should fail):")
        try:
            apply_tariff(100_000_000, -25)
        except ValueError as e:
            print(f"    ✓ Correctly caught error: {e}")
        
        # Test negative trade value
        print("\n  Testing negative trade value (should fail):")
        try:
            apply_tariff(-100_000_000, 25)
        except ValueError as e:
            print(f"    ✓ Correctly caught error: {e}")
        
        # Test non-numeric input
        print("\n  Testing non-numeric input (should fail):")
        try:
            apply_tariff("invalid", 25)
        except TypeError as e:
            print(f"    ✓ Correctly caught error: {e}")
        
        # 7. Calculate tariff impact on Canadian exports
        print("\n[7] Calculate tariff impact on Canadian exports...")
        print("-" * 80)
        if not canada_exports.empty:
            for idx, (_, row) in enumerate(canada_exports.head(2).iterrows(), 1):
                trade_value = row['value_usd']
                tariff_pct = 25  # Example: 25% tariff
                result = apply_tariff(trade_value, tariff_pct)
                print(f"\n  Export {idx}: {row['exporter']} → {row['importer']} ({row['product']})")
                print(f"    Original:      ${result['original_value']:,.0f}")
                print(f"    With 25% tax:  ${result['new_import_cost']:,.0f}")
                print(f"    Cost increase: ${result['tariff_amount']:,.0f}")
        
        print("\n" + "=" * 80)
        print("✓ All examples and tests completed successfully!")
        print("=" * 80)
        
    except FileNotFoundError as e:
        print(f"✗ Error: {e}")
        print(f"  Expected file at: {trade_file}")
        sys.exit(1)
    except Exception as e:
        print(f"✗ Unexpected error: {type(e).__name__}: {e}")
        sys.exit(1)
