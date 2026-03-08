#!/usr/bin/env python
"""
API Test Script

Tests the TradeRipple SimulationEngine API endpoints.

Usage:
  python test_api.py              # Run all tests
  python test_api.py --url http://localhost:8000  # Custom API URL
  python test_api.py --verbose    # Show detailed output
"""

import requests
import json
import time
import argparse
from typing import Optional, Dict, Any


class APITester:
    """Test suite for TradeRipple API endpoints."""
    
    def __init__(self, base_url: str = "http://localhost:8000", verbose: bool = False):
        self.base_url = base_url.rstrip("/")
        self.verbose = verbose
        self.session = requests.Session()
        self.passed_tests = 0
        self.failed_tests = 0
    
    def print_section(self, title: str):
        """Print a formatted section header."""
        print(f"\n{'='*70}")
        print(f"  {title}")
        print(f"{'='*70}")
    
    def print_test(self, test_name: str):
        """Print test name."""
        print(f"\n► {test_name}")
    
    def print_success(self, message: str):
        """Print success message."""
        print(f"  ✓ {message}")
        self.passed_tests += 1
    
    def print_error(self, message: str):
        """Print error message."""
        print(f"  ✗ {message}")
        self.failed_tests += 1
    
    def print_response(self, response: requests.Response):
        """Print response details."""
        if self.verbose:
            print(f"  Status Code: {response.status_code}")
            try:
                print(f"  Response: {json.dumps(response.json(), indent=4)}")
            except:
                print(f"  Response: {response.text}")
    
    def test_health_check(self):
        """Test /health endpoint."""
        self.print_test("Health Check (GET /health)")
        
        try:
            response = self.session.get(f"{self.base_url}/health")
            self.print_response(response)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.print_success("Health check passed")
                    return True
                else:
                    self.print_error("Invalid health response")
                    return False
            else:
                self.print_error(f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.print_error(f"Connection error: {e}")
            return False
    
    def test_single_simulation(self):
        """Test /simulate_tariff endpoint."""
        self.print_test("Single Tariff Simulation (POST /simulate_tariff)")
        
        payload = {
            "exporter_country": "China",
            "importer_country": "Canada",
            "product": "electronics",
            "tariff_percent": 25,
            "elasticity": 0.6
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/simulate_tariff",
                json=payload,
                timeout=5
            )
            self.print_response(response)
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                required_fields = [
                    "timestamp", "exporter_country", "importer_country",
                    "product", "tariff_percent", "execution_time_ms", "results"
                ]
                
                missing_fields = [f for f in required_fields if f not in data]
                if missing_fields:
                    self.print_error(f"Missing fields: {missing_fields}")
                    return False
                
                execution_time = data.get("execution_time_ms", 0)
                if execution_time > 5000:  # 5 seconds is too slow
                    self.print_error(f"Slow response: {execution_time}ms")
                    return False
                
                self.print_success(f"Simulation completed in {execution_time:.2f}ms")
                return True
            else:
                self.print_error(f"HTTP {response.status_code}: {response.text}")
                return False
        except requests.Timeout:
            self.print_error("Request timeout (>5 seconds)")
            return False
        except Exception as e:
            self.print_error(f"Error: {e}")
            return False
    
    def test_various_products(self):
        """Test simulations with different products."""
        self.print_test("Multiple Product Types")
        
        products = [
            ("China", "USA", "steel"),
            ("Vietnam", "Canada", "automobiles"),
            ("Russia", "Europe", "oil_gas"),
            ("Brazil", "USA", "agriculture"),
        ]
        
        success_count = 0
        for exporter, importer, product in products:
            payload = {
                "exporter_country": exporter,
                "importer_country": importer,
                "product": product,
                "tariff_percent": 20
            }
            
            try:
                response = self.session.post(
                    f"{self.base_url}/simulate_tariff",
                    json=payload,
                    timeout=3
                )
                
                if response.status_code == 200:
                    self.print_success(f"{exporter} → {importer}: {product}")
                    success_count += 1
                else:
                    print(f"  ⚠ {exporter} → {importer}: {product} - HTTP {response.status_code}")
            except Exception as e:
                print(f"  ⚠ {exporter} → {importer}: {product} - {e}")
        
        self.print_success(f"{success_count}/{len(products)} product simulations passed")
        return success_count > 0
    
    def test_invalid_input(self):
        """Test error handling with invalid inputs."""
        self.print_test("Invalid Input Handling")
        
        test_cases = [
            ({"exporter_country": "", "importer_country": "USA", "product": "steel", "tariff_percent": 25}, "Empty exporter"),
            ({"exporter_country": "China", "importer_country": "", "product": "steel", "tariff_percent": 25}, "Empty importer"),
            ({"exporter_country": "China", "importer_country": "USA", "product": "", "tariff_percent": 25}, "Empty product"),
            ({"exporter_country": "China", "importer_country": "USA", "product": "steel", "tariff_percent": -10}, "Negative tariff"),
            ({"exporter_country": "China", "importer_country": "USA", "product": "steel", "tariff_percent": 600}, "Tariff too high"),
        ]
        
        success_count = 0
        for payload, error_type in test_cases:
            try:
                response = self.session.post(
                    f"{self.base_url}/simulate_tariff",
                    json=payload,
                    timeout=3
                )
                
                if response.status_code != 200:
                    self.print_success(f"Correctly rejected: {error_type}")
                    success_count += 1
                else:
                    print(f"  ⚠ Should have rejected: {error_type}")
            except Exception as e:
                print(f"  ⚠ {error_type}: {e}")
        
        self.print_success(f"{success_count}/{len(test_cases)} invalid inputs correctly rejected")
        return success_count > 0
    
    def test_batch_simulation(self):
        """Test /simulate_tariff/batch endpoint."""
        self.print_test("Batch Tariff Simulation (POST /simulate_tariff/batch)")
        
        payloads = [
            {
                "exporter_country": "China",
                "importer_country": "Canada",
                "product": "electronics",
                "tariff_percent": 15
            },
            {
                "exporter_country": "China",
                "importer_country": "Canada",
                "product": "electronics",
                "tariff_percent": 25
            },
            {
                "exporter_country": "China",
                "importer_country": "Canada",
                "product": "electronics",
                "tariff_percent": 35
            },
        ]
        
        try:
            response = self.session.post(
                f"{self.base_url}/simulate_tariff/batch",
                json=payloads,
                timeout=10
            )
            self.print_response(response)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list) and len(data) == 3:
                    self.print_success(f"Batch simulation: 3 scenarios processed")
                    return True
                else:
                    self.print_error(f"Unexpected response format")
                    return False
            else:
                self.print_error(f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.print_error(f"Error: {e}")
            return False
    
    def run_all_tests(self):
        """Run all tests."""
        self.print_section("TradeRipple API Test Suite")
        
        print(f"\nTarget URL: {self.base_url}")
        print("Testing API endpoints...")
        
        # Wait a moment for server to be ready
        time.sleep(0.5)
        
        # Run tests
        tests = [
            self.test_health_check,
            self.test_single_simulation,
            self.test_various_products,
            self.test_invalid_input,
            self.test_batch_simulation,
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                self.print_error(f"Test failed: {e}")
        
        # Print summary
        self.print_section("Test Summary")
        total_tests = self.passed_tests + self.failed_tests
        print(f"\nTotal Tests: {total_tests}")
        print(f"Passed: {self.passed_tests} ✓")
        print(f"Failed: {self.failed_tests} ✗")
        
        if self.failed_tests == 0:
            print(f"\n🎉 All tests passed!")
        else:
            print(f"\n⚠️  Some tests failed. Check the output above.")
        
        print()


def main():
    parser = argparse.ArgumentParser(description="Test TradeRipple API")
    parser.add_argument(
        "--url",
        type=str,
        default="http://localhost:8000",
        help="API base URL (default: http://localhost:8000)"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Show detailed output"
    )
    
    args = parser.parse_args()
    
    tester = APITester(base_url=args.url, verbose=args.verbose)
    tester.run_all_tests()


if __name__ == "__main__":
    main()
