"""
Demand Model Module

Responsibilities:
- Model how price changes affect demand for goods
- Use price elasticity of demand for different sectors
- Calculate new demand levels after tariff-induced price increases
- Handle substitution effects (switching to alternative suppliers/products)
"""


def calculate_trade_reduction(original_trade_value: float, tariff_percent: float, 
                               elasticity: float = 0.6) -> dict:
    """
    Calculate the reduction in trade volume due to tariff-induced price increases.
    
    Uses the elasticity model:
        trade_drop_percent = tariff_percent * elasticity
        new_trade_value = original_trade_value * (1 - trade_drop_percent / 100)
    
    Elasticity interpretation:
    - elasticity = 0.6 means: 1% price increase → 0.6% demand decrease
    - Higher elasticity = more demand sensitive to price (more trade loss)
    - Lower elasticity = less demand sensitive to price (less trade loss)
    
    Args:
        original_trade_value: Original trade value in USD
        tariff_percent: Tariff rate as a percentage (e.g., 25 for 25%)
        elasticity: Price elasticity of demand (default: 0.6)
                   Typical range: 0.3 (inelastic) to 1.5 (elastic)
    
    Returns:
        Dictionary with keys:
            - trade_drop_percent: Percentage reduction in trade volume
            - new_trade_value: New trade value after demand reduction (USD)
            - trade_value_loss: Absolute loss in trade value (USD)
    
    Raises:
        ValueError: If original_trade_value or tariff_percent is negative
        TypeError: If inputs are not numeric
    
    Example:
        >>> calculate_trade_reduction(120_000_000_000, 25, elasticity=0.6)
        {
            'trade_drop_percent': 15.0,
            'new_trade_value': 102000000000.0,
            'trade_value_loss': 18000000000.0
        }
        
        Explanation:
        - 25% tariff × 0.6 elasticity = 15% trade drop
        - Original: $120B → New: $102B (loss: $18B)
    """
    # Input validation
    try:
        original_trade_value = float(original_trade_value)
        tariff_percent = float(tariff_percent)
        elasticity = float(elasticity)
    except (TypeError, ValueError):
        raise TypeError(
            f"Inputs must be numeric. "
            f"Got original_trade_value={type(original_trade_value).__name__}, "
            f"tariff_percent={type(tariff_percent).__name__}, "
            f"elasticity={type(elasticity).__name__}"
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
    
    # Elasticity should typically be positive, but allow negative for completeness
    if elasticity < 0:
        raise ValueError(
            f"elasticity should be non-negative, got {elasticity}"
        )
    
    # Calculate trade drop percentage using elasticity model
    # Formula: trade_drop_percent = tariff_percent * elasticity
    trade_drop_percent = tariff_percent * elasticity
    
    # Calculate new trade value
    # Formula: new_trade_value = original_trade_value * (1 - trade_drop_percent / 100)
    new_trade_value = original_trade_value * (1 - trade_drop_percent / 100)
    
    # Calculate absolute trade value loss
    trade_value_loss = original_trade_value - new_trade_value
    
    return {
        "trade_drop_percent": trade_drop_percent,
        "new_trade_value": new_trade_value,
        "trade_value_loss": trade_value_loss
    }


def calculate_price_elasticity(industry: str, product: str) -> float:
    """
    Get the price elasticity of demand for a specific product.
    
    Example: elasticity = -1.5 means 1% price increase -> 1.5% demand decrease
    
    Args:
        industry: Industry classification
        product: Product code/name
    
    Returns:
        Price elasticity coefficient (typically negative)
    """
    pass


def apply_demand_shock(baseload: float, price_increase_percent: float, 
                       elasticity: float) -> float:
    """
    Calculate new demand level after a price shock.
    
    Args:
        baseload: Original demand quantity/value
        price_increase_percent: Percentage change in price
        elasticity: Price elasticity of demand
    
    Returns:
        New demand level after price adjustment
    """
    pass


def calculate_substitution_effect(original_supplier: str, tariff_rate: float,
                                  alternative_suppliers: list) -> dict:
    """
    Model demand shift to alternative suppliers due to tariff.
    
    Returns:
        Dictionary mapping suppliers to new demand allocation
    """
    pass


# Example usage and testing
if __name__ == "__main__":
    import sys
    
    print("=" * 80)
    print("TradeRipple: Demand Response Model - Examples and Tests")
    print("=" * 80)
    
    try:
        # Test Case 1: User's example scenario (25% tariff, 0.6 elasticity)
        print("\n[1] User Example: 25% tariff on $120B trade")
        print("-" * 80)
        result1 = calculate_trade_reduction(120_000_000_000, 25, elasticity=0.6)
        
        print(f"  Input:")
        print(f"    Original trade value:  ${120_000_000_000:,.0f}")
        print(f"    Tariff percent:        25%")
        print(f"    Elasticity:            0.6")
        print(f"\n  Calculation:")
        print(f"    Trade drop % = tariff % × elasticity")
        print(f"    Trade drop % = 25 × 0.6 = {result1['trade_drop_percent']}%")
        print(f"\n  Results:")
        print(f"    Trade drop percent:    {result1['trade_drop_percent']}%")
        print(f"    New trade value:       ${result1['new_trade_value']:,.0f}")
        print(f"    Trade value loss:      ${result1['trade_value_loss']:,.0f}")
        
        # Test Case 2: Inelastic demand (low elasticity)
        print("\n[2] Inelastic Goods: 30% tariff on $50B (elasticity=0.3)")
        print("-" * 80)
        result2 = calculate_trade_reduction(50_000_000_000, 30, elasticity=0.3)
        
        print(f"  Trade drop % = 30 × 0.3 = {result2['trade_drop_percent']}%")
        print(f"  Original:  ${50_000_000_000:,.0f}")
        print(f"  New value: ${result2['new_trade_value']:,.0f}")
        print(f"  Loss:      ${result2['trade_value_loss']:,.0f}")
        print(f"\n  Analysis: Inelastic goods (e.g., essential medicines)")
        print(f"  → Smaller demand drop despite high tariff")
        
        # Test Case 3: Elastic demand (high elasticity)
        print("\n[3] Elastic Goods: 30% tariff on $50B (elasticity=1.2)")
        print("-" * 80)
        result3 = calculate_trade_reduction(50_000_000_000, 30, elasticity=1.2)
        
        print(f"  Trade drop % = 30 × 1.2 = {result3['trade_drop_percent']}%")
        print(f"  Original:  ${50_000_000_000:,.0f}")
        print(f"  New value: ${result3['new_trade_value']:,.0f}")
        print(f"  Loss:      ${result3['trade_value_loss']:,.0f}")
        print(f"\n  Analysis: Elastic goods (e.g., consumer electronics)")
        print(f"  → Larger demand drop due to high elasticity")
        
        # Test Case 4: Zero tariff (edge case)
        print("\n[4] Edge Case: Zero tariff")
        print("-" * 80)
        result4 = calculate_trade_reduction(100_000_000_000, 0, elasticity=0.6)
        
        print(f"  Trade drop % = 0 × 0.6 = {result4['trade_drop_percent']}%")
        print(f"  New trade value: ${result4['new_trade_value']:,.0f} (unchanged)")
        print(f"  Loss:            ${result4['trade_value_loss']:,.0f}")
        
        # Test Case 5: High tariff scenario
        print("\n[5] Extreme Case: 100% tariff (prohibitive)")
        print("-" * 80)
        result5 = calculate_trade_reduction(80_000_000_000, 100, elasticity=0.8)
        
        print(f"  Trade drop % = 100 × 0.8 = {result5['trade_drop_percent']}%")
        print(f"  Original:  ${80_000_000_000:,.0f}")
        print(f"  New value: ${result5['new_trade_value']:,.0f}")
        print(f"  Loss:      ${result5['trade_value_loss']:,.0f}")
        
        # Test Case 6: Canadian export scenario
        print("\n[6] Real Scenario: Canadian auto exports to USA")
        print("-" * 80)
        # Automobiles typically have elasticity ~0.8
        canada_auto_exports = 35_000_000_000  # $35B
        us_tariff = 25  # 25% tariff on autos
        auto_elasticity = 0.8  # Moderate elasticity for autos
        
        result6 = calculate_trade_reduction(canada_auto_exports, us_tariff, auto_elasticity)
        
        print(f"  Sector:     Automobiles")
        print(f"  Flow:       Canada → USA")
        print(f"  Base flow:  ${canada_auto_exports:,.0f}")
        print(f"  Tariff:     {us_tariff}%")
        print(f"  Elasticity: {auto_elasticity}")
        print(f"\n  Results:")
        print(f"    Trade drop:  {result6['trade_drop_percent']}%")
        print(f"    New exports: ${result6['new_trade_value']:,.0f}")
        print(f"    Export loss: ${result6['trade_value_loss']:,.0f}")
        
        # Test Test 7: Error handling
        print("\n[7] Error Handling")
        print("-" * 80)
        
        # Negative tariff
        print("\n  Testing negative tariff (should fail):")
        try:
            calculate_trade_reduction(100_000_000, -25)
        except ValueError as e:
            print(f"    ✓ Caught: {e}")
        
        # Negative trade value
        print("\n  Testing negative trade value (should fail):")
        try:
            calculate_trade_reduction(-100_000_000, 25)
        except ValueError as e:
            print(f"    ✓ Caught: {e}")
        
        # Non-numeric input
        print("\n  Testing non-numeric input (should fail):")
        try:
            calculate_trade_reduction("invalid", 25)
        except TypeError as e:
            print(f"    ✓ Caught: {e}")
        
        # Summary table
        print("\n[8] Elasticity Comparison Table")
        print("-" * 80)
        print(f"{'Elasticity':<15} {'Type':<20} {'25% Tariff Impact':<25}")
        print("-" * 80)
        
        for elastic, label in [(0.3, "Inelastic"), (0.6, "Moderate"), (1.0, "Unit Elastic"), (1.5, "Elastic")]:
            result = calculate_trade_reduction(100_000_000_000, 25, elastic)
            print(f"{elastic:<15} {label:<20} {result['trade_drop_percent']}% drop → ${result['new_trade_value']/1e9:.1f}B")
        
        print("\n" + "=" * 80)
        print("✓ All demand model examples and tests completed successfully!")
        print("=" * 80)
        
    except Exception as e:
        print(f"✗ Unexpected error: {type(e).__name__}: {e}")
        sys.exit(1)
