# TradeRipple Simulation Backend

A comprehensive FastAPI-based backend for simulating tariff impacts on global trade flows, prices, supply chains, and Canada-specific economics.

## Overview

TradeRipple analyzes how tariffs between countries affect:
- **Trade Flows**: Changes in bilateral trade volumes
- **Prices**: Consumer price impacts and tariff costs
- **Supply Chains**: Redistribution of trade to alternative suppliers
- **Ripple Effects**: Cascading impacts through dependent industries
- **Canada Impact**: Sector-specific benefits and competitiveness analysis

## Project Structure

```
trade_simulation/
├── api/                          # FastAPI server
│   ├── __init__.py
│   └── server.py                # Main API server with endpoints
├── simulation/                   # Core simulation modules
│   ├── __init__.py
│   ├── tariff_calculator.py      # Tariff cost calculations
│   ├── demand_model.py           # Demand reduction via elasticity
│   ├── supply_shift_model.py     # Trade redistribution logic
│   ├── canada_impact_model.py    # Canada-specific impact analysis
│   └── simulation_engine.py      # Main orchestration engine
├── data/                         # CSV data files (referenced by simulation)
│   ├── trade_flows.csv           # Bilateral trade data
│   └── industry_dependencies.csv # Supply chain dependencies
├── requirements.txt              # Python dependencies
├── run_server.py                 # Server startup script
├── test_api.py                   # API test suite
├── API.md                        # Complete API documentation
├── API_INTEGRATION.tsx           # React integration example
└── README.md                     # This file
```

## Quick Start

### 1. Install Dependencies

```bash
cd trade_simulation
pip install -r requirements.txt
```

### 2. Prepare Data

Ensure your data files exist in the `data/` directory:
- `trade_flows.csv`
- `industry_dependencies.csv`

See [Data Format](#data-format) below for required column schemas.

### 3. Start the Server

```bash
# Option 1: Using the startup script
python run_server.py

# Option 2: Using uvicorn directly
uvicorn api.server:app --reload --host 0.0.0.0 --port 8000

# Option 3: Using the startup script with custom settings
python run_server.py --host 127.0.0.1 --port 5000 --no-reload
```

The API will be available at:
- **Main API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **OpenAPI Spec**: http://localhost:8000/openapi.json

### 4. Test the API

```bash
# Run the test suite
python test_api.py

# Test with custom API URL
python test_api.py --url http://localhost:8000 --verbose
```

### 5. Make Your First Request

```bash
curl -X POST http://localhost:8000/simulate_tariff \
  -H "Content-Type: application/json" \
  -d '{
    "exporter_country": "China",
    "importer_country": "Canada",
    "product": "electronics",
    "tariff_percent": 25,
    "elasticity": 0.6
  }'
```

## Core Modules

### 1. Tariff Calculator (`simulation/tariff_calculator.py`)

Calculates tariff costs and loads trade flow data.

**Key Functions:**
- `load_trade_data(filepath)` - Loads and validates trade flows CSV
- `get_trade_flow(exporter, importer, product)` - Retrieves specific trade values
- `apply_tariff(trade_value, tariff_percent)` - Calculates tariff cost

**Output:**
```json
{
  "original_trade_value": 120000000,
  "tariff_cost": 30000000,
  "price_increase_percent": 25,
  "new_import_cost": 150000000
}
```

### 2. Demand Model (`simulation/demand_model.py`)

Models how price increases reduce demand using elasticity.

**Formula:** `trade_reduction% = tariff% × elasticity`

**Example:** 25% tariff × 0.6 elasticity = 15% trade reduction

**Key Functions:**
- `calculate_trade_reduction(trade_value, tariff_percent, elasticity=0.6)`

**Output:**
```json
{
  "trade_drop_percent": 15,
  "new_trade_value": 102000000,
  "trade_value_loss": 18000000
}
```

### 3. Supply Shift Model (`simulation/supply_shift_model.py`)

Redistributes lost trade to alternative suppliers.

**Configured Products:**
- electronics, cars, steel, lumber, agriculture
- machinery, semiconductors, textiles, chemicals, oil_gas

**Key Functions:**
- `redistribute_trade(product, lost_trade_value)` - Distributes lost trade
- `get_supplier_alternatives(product)` - Lists suppliers for product

**Output:**
```json
{
  "alternative_suppliers": [
    {"country": "Vietnam", "trade_gain": 6000000},
    {"country": "Taiwan", "trade_gain": 6000000}
  ]
}
```

### 4. Canada Impact Model (`simulation/canada_impact_model.py`)

Analyzes Canada-specific tariff impacts through:
- Ripple effects (supply chain cascades)
- Sector competitiveness (advantage weighting)
- Trade gain potential

**Canadian Sector Advantages:**
- 🌲 **Lumber**: 0.8 (world's largest exporter)
- ⛽ **Oil & Gas**: 0.75 (geographic advantage)
- ⛏️ **Mining**: 0.70 (mineral resources)
- 🌾 **Agriculture**: 0.65 (competitive position)
- 🏗️ **Steel**: 0.55 (regional producer)
- 🧪 **Chemicals**: 0.50 (moderate competitiveness)
- ⚙️ **Machinery**: 0.45 (niche products)
- 🚗 **Automobiles**: 0.60 (Mexico competition)
- 📱 **Electronics**: 0.25 (China/Taiwan dominate)

**Key Functions:**
- `calculate_ripple_effect(industry, price_increase%)` - Cascading impacts
- `calculate_canada_impact(product, trade_shifts)` - Sector-specific analysis

### 5. Simulation Engine (`simulation/simulation_engine.py`)

Orchestrates all modules into a coordinated workflow.

**7-Step Process:**
1. Load trade flow baseline data
2. Apply tariff to affected trade
3. Calculate demand reduction
4. Compute lost trade value
5. Redistribute to alternative suppliers
6. Calculate supply chain ripple effects
7. Evaluate Canada-specific impacts

**Key Methods:**
- `run_simulation(exporter, importer, product, tariff_percent, elasticity=0.6)`
- `compare_scenarios(scenarios)` - Comparative analysis
- `export_results(results, format='json')` - Output formatting

## API Reference

### Main Endpoints

#### POST `/simulate_tariff`
Simulate a single tariff scenario.

**Request:**
```json
{
  "exporter_country": "China",
  "importer_country": "Canada",
  "product": "electronics",
  "tariff_percent": 25,
  "elasticity": 0.6
}
```

**Response:**
```json
{
  "timestamp": "2026-03-07T12:34:56.789123",
  "exporter_country": "China",
  "importer_country": "Canada",
  "product": "electronics",
  "tariff_percent": 25,
  "execution_time_ms": 245.3,
  "results": {
    "baseline": {...},
    "trade_changes": {...},
    "price_effects": {...},
    "supply_shifts": {...},
    "ripple_effects": [...],
    "canada_impact": {...},
    "summary": {...}
  }
}
```

#### POST `/simulate_tariff/batch`
Run multiple simulations in one request.

#### POST `/compare`
Compare multiple scenarios.

#### GET `/health`
Health check endpoint.

See [API.md](API.md) for complete endpoint documentation.

## Data Format

### trade_flows.csv

```csv
exporter,importer,product,value_usd
China,Canada,electronics,120000000
China,USA,automobiles,250000000
Vietnam,Canada,electronics,45000000
...
```

**Required Columns:**
- `exporter`: Source country (ISO country name)
- `importer`: Destination country (ISO country name)
- `product`: Product category
- `value_usd`: Annual trade value in USD

### industry_dependencies.csv

```csv
input_industry,dependent_industry,dependency_weight,supplier_countries
electronics,manufacturing,0.8,"China;Taiwan;Vietnam"
steel,automobiles,0.6,"USA;Japan;Germany"
...
```

**Required Columns:**
- `input_industry`: Input sector
- `dependent_industry`: Sector that depends on input
- `dependency_weight`: Strength of dependency (0-1)
- `supplier_countries`: Semicolon-separated suppliers

## Performance

- **Typical Response Time**: < 1 second
- **Execution Time Tracking**: Included in every response
- **Caching**: Global module-level caching of loaded data

### Performance Metrics

Response times by scenario:
- Single simulation: ~250-350ms
- Batch (3 scenarios): ~750-1000ms
- Complex analysis with ripple effects: ~300-500ms

## Integration with React Frontend

### Using the Custom Hook

```jsx
import useTradeRippleAPI from './API_INTEGRATION';

function MyComponent() {
  const { simulateTariff, loading, error } = useTradeRippleAPI();
  
  const runSimulation = async () => {
    const result = await simulateTariff({
      exporter_country: 'China',
      importer_country: 'Canada',
      product: 'electronics',
      tariff_percent: 25
    });
    
    if (result) {
      console.log('Simulation complete:', result);
    }
  };
  
  return (
    <div>
      <button onClick={runSimulation} disabled={loading}>
        {loading ? 'Simulating...' : 'Run Simulation'}
      </button>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

See [API_INTEGRATION.tsx](API_INTEGRATION.tsx) for full React integration examples.

## Configuration

### Environment Variables

```bash
# Server configuration
HOST=0.0.0.0
PORT=8000
RELOAD=true

# API configuration
API_URL=http://localhost:8000

# Data directory
DATA_DIR=./data
```

### CORS Configuration

By default, CORS is enabled for all origins. For production, restrict to specific domains:

```python
# In api/server.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

## Troubleshooting

### 1. "Data files not found"
- Ensure `data/trade_flows.csv` and `data/industry_dependencies.csv` exist
- Check file paths in `SimulationEngine`

### 2. "Cannot connect to API"
- Verify server is running: `python run_server.py`
- Check port 8000 is available
- Ensure no firewall blocks localhost:8000

### 3. "Slow API responses"
- Check `execution_time_ms` in response
- Verify data file sizes aren't too large
- Ensure adequate available memory

### 4. "CORS errors from React"
- CORS is enabled for all origins by default
- Check browser console for specific error message
- Verify API URL in React is correct

## Development

### Adding New Simulation Models

1. Create a new module in `simulation/`
2. Implement your calculation function
3. Update `SimulationEngine.run_simulation()` to call your function
4. Add tests to validate behavior

### Running Tests

```bash
# Test the API
python test_api.py --verbose

# Test individual modules
python -m pytest simulation/test_*.py

# Test with custom API URL
python test_api.py --url http://your-server.com:8000
```

### Debugging

Enable verbose logging:
```bash
uvicorn api.server:app --reload --log-level debug
```

## Production Deployment

### Using Gunicorn

```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker api.server:app
```

### Using Docker

```dockerfile
FROM python:3.10
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "api.server:app"]
```

### Using AWS Lambda

See AWS FastAPI deployment guides for Lambda integration.

## Contributing

To improve the simulation models:

1. Update calculation logic in relevant module
2. Add test cases for new scenarios
3. Document changes in module docstrings
4. Run test suite: `python test_api.py`

## API Documentation Files

- **[API.md](API.md)** - Comprehensive API endpoint documentation
- **[API_INTEGRATION.tsx](API_INTEGRATION.tsx)** - React integration examples
- **[run_server.py](run_server.py)** - Server startup script
- **[test_api.py](test_api.py)** - API test suite

## Support

For issues or questions:
1. Check [API.md](API.md) for endpoint documentation
2. Review error messages and HTTP status codes
3. Check server logs with `--log-level debug`
4. Run test suite: `python test_api.py --verbose`

## License

TradeRipple © 2026 - All Rights Reserved

---

**Next Steps:**
1. Populate CSV files with real trade data
2. Deploy to production server
3. Connect React frontend via API integration
4. Run comparative scenario analysis
5. Monitor performance metrics and optimize
