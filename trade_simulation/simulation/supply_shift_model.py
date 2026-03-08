"""
Supply Shift Model Module

Responsibilities:
- Model how tariffs affect supply chains and production
- Calculate cost-push inflation from input tariffs
- Model upstream/downstream industry impacts
- Handle supply chain adjustments and rerouting
"""

# Configurable mapping of products to alternative suppliers
# When tariffs disrupt trade from a primary supplier, these alternatives can absorb trade
SUPPLIER_ALTERNATIVES = {
    "electronics": ["Vietnam", "Taiwan", "Mexico", "Thailand"],
    "cars": ["Germany", "Japan", "Mexico", "South Korea"],
    "steel": ["Canada", "South Korea", "Brazil", "India"],
    "lumber": ["Canada", "Sweden", "Brazil", "Russia"],
    "agriculture": ["Brazil", "Argentina", "India", "Ukraine"],
    "machinery": ["Germany", "Japan", "Italy", "France"],
    "semiconductors": ["Taiwan", "South Korea", "Singapore", "Philippines"],
    "textiles": ["Vietnam", "India", "Indonesia", "Mexico"],
    "chemicals": ["Germany", "China", "France", "Belgium"],
    "oil_gas": ["Saudi Arabia", "Russia", "Canada", "UAE"],
}


def redistribute_trade(product: str, lost_trade_value: float) -> list:
    """
    Redistribute lost trade value to alternative suppliers.
    
    When tariffs cause trade with one supplier to drop, the lost trade volume
    can be partially absorbed by alternative suppliers. This function distributes
    the lost trade equally among available alternatives.
    
    Args:
        product: Product name/category (must exist in SUPPLIER_ALTERNATIVES)
        lost_trade_value: Trade value lost due to tariffs (USD)
    
    Returns:
        List of dictionaries, each containing:
            - country: Alternative supplier country
            - trade_gain: Amount of trade this supplier gains (USD)
    
    Raises:
        ValueError: If product not found in supplier alternatives
        ValueError: If lost_trade_value is negative
        TypeError: If lost_trade_value is not numeric
    
    Example:
        >>> redistribute_trade("electronics", 18_000_000_000)
        [
            {"country": "Vietnam", "trade_gain": 4500000000},
            {"country": "Taiwan", "trade_gain": 4500000000},
            {"country": "Mexico", "trade_gain": 4500000000},
            {"country": "Thailand", "trade_gain": 4500000000}
        ]
        
        Explanation:
        - Lost trade of $18B is split evenly among 4 suppliers
        - Each supplier gets $4.5B
    """
    # Input validation
    try:
        lost_trade_value = float(lost_trade_value)
    except (TypeError, ValueError):
        raise TypeError(
            f"lost_trade_value must be numeric, got {type(lost_trade_value).__name__}"
        )
    
    if lost_trade_value < 0:
        raise ValueError(
            f"lost_trade_value must be non-negative, got {lost_trade_value}"
        )
    
    # Validate product exists
    product_lower = product.lower().strip()
    if product_lower not in SUPPLIER_ALTERNATIVES:
        available = ", ".join(sorted(SUPPLIER_ALTERNATIVES.keys()))
        raise ValueError(
            f"Product '{product}' not found in supplier database. "
            f"Available products: {available}"
        )
    
    # Get alternative suppliers for this product
    suppliers = SUPPLIER_ALTERNATIVES[product_lower]
    
    # If no suppliers, return empty list
    if not suppliers:
        return []
    
    # Calculate trade gain per supplier (evenly distributed)
    trade_per_supplier = lost_trade_value / len(suppliers)
    
    # Build result list
    result = [
        {
            "country": supplier,
            "trade_gain": trade_per_supplier
        }
        for supplier in suppliers
    ]
    
    return result


def add_supplier_alternative(product: str, supplier_list: list) -> None:
    """
    Add or update a product's supplier alternatives.
    
    Args:
        product: Product name/category
        supplier_list: List of supplier countries
    
    Example:
        >>> add_supplier_alternative("solar_panels", ["China", "Vietnam", "India"])
    """
    SUPPLIER_ALTERNATIVES[product.lower().strip()] = supplier_list


def get_supplier_alternatives(product: str) -> list:
    """
    Get the list of alternative suppliers for a product.
    
    Args:
        product: Product name/category
    
    Returns:
        List of supplier countries
    
    Raises:
        ValueError: If product not found
    """
    product_lower = product.lower().strip()
    if product_lower not in SUPPLIER_ALTERNATIVES:
        raise ValueError(f"Product '{product}' not found in supplier database")
    
    return SUPPLIER_ALTERNATIVES[product_lower].copy()


def calculate_input_cost_increase(industry: str, input_tariff: float) -> float:
    """
    Calculate how input cost tariffs affect production costs.
    
    Args:
        industry: Industry that uses the input
        input_tariff: Tariff rate on imported inputs
    
    Returns:
        Percentage increase in production costs
    """
    pass


def model_supply_chain_impact(industry: str, affected_suppliers: list, 
                              tariff_scenario: dict) -> dict:
    """
    Model cascading effects through supply chains.
    
    Accounts for:
    - Direct input tariffs
    - Indirect costs from supplier impacts
    - Supply disruption risks
    
    Returns:
        Industry-level impact metrics
    """
    pass


def calculate_stagflation_dynamic(demand_reduction: float, cost_increase: float,
                                  industry: str) -> dict:
    """
    Model stagflation effect: reduced output + increased prices.
    
    Returns:
        Production output and price level changes
    """
    pass


def route_supply_alternative(source_country: str, tariff_rate: float,
                            alternatives: list) -> dict:
    """
    Determine if supply will reroute to non-tariffed sources.
    
    Returns:
        New supply allocation across countries
    """
    pass


# Example usage and testing
if __name__ == "__main__":
    import sys
    import json
    
    print("=" * 90)
    print("TradeRipple: Supply Chain Shift Model - Examples and Tests")
    print("=" * 90)
    
    try:
        # Test Case 1: User's exact example (electronics)
        print("\n[1] User Example: Electronics Trade Redistribution")
        print("-" * 90)
        
        product = "electronics"
        lost_trade = 18_000_000_000  # $18B lost due to 15% drop
        
        print(f"  Scenario:")
        print(f"    Product:        {product}")
        print(f"    Lost trade:     ${lost_trade:,.0f}")
        print(f"    Original trade: $120B → After tariff: $102B (15% drop)")
        
        result = redistribute_trade(product, lost_trade)
        print(f"\n  Alternative suppliers and trade gains:")
        print(f"  {'-' * 86}")
        
        total_redistributed = 0
        for idx, entry in enumerate(result, 1):
            print(f"    {idx}. {entry['country']:<15} ${entry['trade_gain']:>15,.0f}")
            total_redistributed += entry['trade_gain']
        
        print(f"  {'-' * 86}")
        print(f"    Total redistributed: ${total_redistributed:>15,.0f}")
        
        # Test Case 2: Cars
        print("\n[2] Automotive Sector: Cars Trade Redistribution")
        print("-" * 90)
        
        cars_lost_trade = 12_500_000_000  # $12.5B example
        result_cars = redistribute_trade("cars", cars_lost_trade)
        
        print(f"  Lost trade: ${cars_lost_trade:,.0f}")
        print(f"  Redistributed to:")
        for supplier in result_cars:
            print(f"    • {supplier['country']:<15} ${supplier['trade_gain']:>15,.0f}")
        
        # Test Case 3: Steel
        print("\n[3] Steel Industry: Supply Chain Resilience")
        print("-" * 90)
        
        steel_lost = 8_000_000_000  # $8B
        result_steel = redistribute_trade("steel", steel_lost)
        
        print(f"  Lost trade: ${steel_lost:,.0f}")
        print(f"  Alternative suppliers count: {len(result_steel)}")
        print(f"  Each supplier gains: ${result_steel[0]['trade_gain']:,.0f}")
        
        # Test Case 4: Lumber (Canada's perspective)
        print("\n[4] Lumber Sector: Canadian Alternative to Tariffed Supply")
        print("-" * 90)
        
        lumber_lost = 5_000_000_000  # $5B
        result_lumber = redistribute_trade("lumber", lumber_lost)
        
        print(f"  Lost trade: ${lumber_lost:,.0f}")
        print(f"  Possible beneficiaries:")
        for supplier in result_lumber:
            if supplier['country'] == "Canada":
                print(f"    ⭐ {supplier['country']:<15} ${supplier['trade_gain']:>15,.0f} (CANADIAN GAIN)")
            else:
                print(f"    • {supplier['country']:<15} ${supplier['trade_gain']:>15,.0f}")
        
        # Test Case 5: Agriculture
        print("\n[5] Agriculture: Displaced Trade Distribution")
        print("-" * 90)
        
        ag_lost = 25_000_000_000  # $25B
        result_ag = redistribute_trade("agriculture", ag_lost)
        
        print(f"  Lost trade: ${ag_lost:,.0f}")
        print(f"  Distribution (even split):")
        for supplier in result_ag:
            print(f"    • {supplier['country']:<15} ${supplier['trade_gain']:>15,.0f} ({100/len(result_ag):.1f}%)")
        
        # Test Case 6: Semiconductors (high-value)
        print("\n[6] Semiconductors: High-Value Trade Redistribution")
        print("-" * 90)
        
        semi_lost = 45_000_000_000  # $45B
        result_semi = redistribute_trade("semiconductors", semi_lost)
        
        print(f"  Lost trade: ${semi_lost:,.0f}")
        print(f"  Beneficiaries (per supplier):")
        total_semi = 0
        for supplier in result_semi:
            print(f"    • {supplier['country']:<15} ${supplier['trade_gain']:>15,.0f}")
            total_semi += supplier['trade_gain']
        
        print(f"  Total accounted: ${total_semi:,.0f}")
        
        # Test Case 7: Zero lost trade (edge case)
        print("\n[7] Edge Case: Zero Lost Trade")
        print("-" * 90)
        
        result_zero = redistribute_trade("electronics", 0)
        print(f"  Lost trade: $0")
        for supplier in result_zero:
            print(f"    • {supplier['country']:<15} ${supplier['trade_gain']:>15,.0f}")
        
        # Test Case 8: Small trade loss
        print("\n[8] Small Trade Loss: Consumer Goods")
        print("-" * 90)
        
        small_loss = 1_200_000_000  # $1.2B
        result_small = redistribute_trade("textiles", small_loss)
        
        print(f"  Lost trade: ${small_loss:,.0f}")
        for supplier in result_small:
            print(f"    • {supplier['country']:<15} ${supplier['trade_gain']:>15,.0f}")
        
        # Test Case 9: Error handling - Invalid product
        print("\n[9] Error Handling: Invalid Product")
        print("-" * 90)
        
        print("  Testing invalid product 'quantum_computers':")
        try:
            redistribute_trade("quantum_computers", 1_000_000_000)
        except ValueError as e:
            print(f"    ✓ Correctly caught: {str(e)[:70]}...")
        
        # Test Case 10: Error handling - Negative trade
        print("\n[10] Error Handling: Negative Trade Value")
        print("-" * 90)
        
        print("  Testing negative trade value:")
        try:
            redistribute_trade("electronics", -5_000_000_000)
        except ValueError as e:
            print(f"    ✓ Correctly caught: {e}")
        
        # Test Case 11: Error handling - Non-numeric input
        print("\n[11] Error Handling: Non-numeric Input")
        print("-" * 90)
        
        print("  Testing non-numeric lost_trade_value:")
        try:
            redistribute_trade("electronics", "invalid")
        except TypeError as e:
            print(f"    ✓ Correctly caught: {e}")
        
        # Test Case 12: Get available products
        print("\n[12] Available Products in Supply Database")
        print("-" * 90)
        
        print(f"  {len(SUPPLIER_ALTERNATIVES)} product categories available:")
        for product_name, suppliers in sorted(SUPPLIER_ALTERNATIVES.items()):
            print(f"    • {product_name:<20} ({len(suppliers)} suppliers: {', '.join(suppliers[:2])}...)")
        
        # Test Case 13: Query supplier alternatives
        print("\n[13] Query Supplier Alternatives")
        print("-" * 90)
        
        for product_name in ["electronics", "cars", "lumber"]:
            suppliers = get_supplier_alternatives(product_name)
            print(f"  {product_name:<15} suppliers: {', '.join(suppliers)}")
        
        # Test Case 14: Add custom product
        print("\n[14] Extending Supplier Database")
        print("-" * 90)
        
        print("  Adding new product type: 'solar_panels'")
        add_supplier_alternative("solar_panels", ["China", "Vietnam", "India", "Germany"])
        
        result_solar = redistribute_trade("solar_panels", 10_000_000_000)
        print(f"  Trade redistribution for solar panels ($10B):")
        for supplier in result_solar:
            print(f"    • {supplier['country']:<15} ${supplier['trade_gain']:>15,.0f}")
        
        # Summary: Cascade effects example
        print("\n[15] Cascading Supply Chain Effects: Full Scenario")
        print("-" * 90)
        
        print("  Scenario: 25% tariff on China electronics imports to USA")
        print(f"  Original trade:        $120,000,000,000")
        print(f"  Trade drop (15%):      $  18,000,000,000")
        print(f"\n  Redistribution cascade:")
        
        final_flow = redistribute_trade("electronics", 18_000_000_000)
        
        for idx, flow in enumerate(final_flow, 1):
            percentage = (flow['trade_gain'] / 18_000_000_000) * 100
            print(f"    → {flow['country']:<15} gains ${flow['trade_gain']:>15,.0f} ({percentage:.1f}%)")
        
        print("\n" + "=" * 90)
        print("✓ All supply chain shift model examples completed successfully!")
        print("=" * 90)
        
    except Exception as e:
        print(f"\n✗ Unexpected error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
