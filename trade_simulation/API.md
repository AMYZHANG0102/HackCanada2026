# TradeRipple Simulation Engine - API Documentation

## Overview

The TradeRipple Simulation Engine provides a FastAPI-based REST API for analyzing how tariffs affect global trade flows, prices, and supply chains. The API is designed to support the TradeRipple React frontend with CORS-enabled endpoints.

## Quick Start

### Prerequisites
- Python 3.10+
- Required packages in `requirements.txt`

### Installation & Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Start the server
python run_server.py

# Or use uvicorn directly
uvicorn api.server:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **Main API**: http://localhost:8000
- **Interactive Docs (Swagger UI)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc

---

## API Endpoints

### 1. Simulate Tariff Impact

**Endpoint:** `POST /simulate_tariff`

Runs a complete tariff impact simulation for a specific trade flow between countries.

#### Request Body

```json
{
  "exporter_country": "China",
  "importer_country": "Canada",
  "product": "electronics",
  "tariff_percent": 25,
  "elasticity": 0.6
}
```

**Parameters:**
- `exporter_country` (string, required): Country exporting the product (e.g., "China", "USA", "Germany")
- `importer_country` (string, required): Country importing the product (e.g., "Canada", "USA")
- `product` (string, required): Product category
  - Valid values: `electronics`, `cars`, `steel`, `lumber`, `agriculture`, `machinery`, `semiconductors`, `textiles`, `chemicals`, `oil_gas`
- `tariff_percent` (float, required): Tariff rate as a percentage (0-500%)
- `elasticity` (float, optional): Price elasticity of demand (default: 0.6, range: 0.1-2.0)

#### Response

```json
{
  "timestamp": "2026-03-07T12:34:56.789123",
  "exporter_country": "China",
  "importer_country": "Canada",
  "product": "electronics",
  "tariff_percent": 25,
  "execution_time_ms": 245.3,
  "results": {
    "baseline": {
      "trade_value_usd": 120000000,
      "exporter": "China",
      "importer": "Canada",
      "product": "electronics"
    },
    "trade_changes": {
      "tariff_cost_usd": 30000000,
      "price_increase_percent": 25,
      "trade_reduction_percent": 15,
      "new_trade_value_usd": 102000000
    },
    "price_effects": {
      "import_price_increase_percent": 25,
      "consumer_price_impact": "Moderate"
    },
    "supply_shifts": {
      "lost_trade_value_usd": 18000000,
      "alternative_suppliers": [
        {
          "country": "Vietnam",
          "trade_gain_usd": 6000000
        },
        {
          "country": "Taiwan",
          "trade_gain_usd": 6000000
        },
        {
          "country": "South Korea",
          "trade_gain_usd": 6000000
        }
      ]
    },
    "ripple_effects": [
      {
        "affected_industry": "Manufacturing",
        "price_increase_percent": 12.5,
        "dependency_weight": 0.5
      }
    ],
    "canada_impact": {
      "sector": "electronics",
      "competitiveness_rating": 0.25,
      "estimated_trade_gain_usd": 2500000,
      "sector_benefit": "Low - dominated by China/Taiwan"
    },
    "summary": {
      "total_trade_lost": 18000000,
      "primary_impact": "Supply chain disruption",
      "secondary_impacts": ["Higher consumer prices", "Shift to alternative suppliers"]
    }
  }
}
```

**Status Code:** `200 OK`

#### Error Responses

**400 Bad Request** - Invalid input parameters
```json
{
  "detail": "Invalid input: tariff_percent must be between 0 and 500"
}
```

**503 Service Unavailable** - Data files not found
```json
{
  "detail": "Data files not found. Please ensure CSV files are in the data directory."
}
```

**500 Internal Server Error** - Simulation engine error
```json
{
  "detail": "Simulation error: [error message]"
}
```

#### Example Usage

**cURL:**
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

**JavaScript/Fetch:**
```javascript
const response = await fetch('http://localhost:8000/simulate_tariff', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    exporter_country: 'China',
    importer_country: 'Canada',
    product: 'electronics',
    tariff_percent: 25,
    elasticity: 0.6
  })
});

const results = await response.json();
console.log(results);
```

**Python:**
```python
import requests
import json

url = 'http://localhost:8000/simulate_tariff'
payload = {
    'exporter_country': 'China',
    'importer_country': 'Canada',
    'product': 'electronics',
    'tariff_percent': 25,
    'elasticity': 0.6
}

response = requests.post(url, json=payload)
results = response.json()
print(json.dumps(results, indent=2))
```

---

### 2. Batch Tariff Simulation

**Endpoint:** `POST /simulate_tariff/batch`

Run multiple tariff impact simulations in a single request. Useful for comparing scenarios.

#### Request Body

```json
[
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
  }
]
```

#### Response

```json
[
  {
    "timestamp": "2026-03-07T12:34:56.789123",
    "exporter_country": "China",
    "importer_country": "Canada",
    "product": "electronics",
    "tariff_percent": 15,
    "execution_time_ms": 245.3,
    "results": { ... }
  },
  {
    "timestamp": "2026-03-07T12:34:57.234567",
    "exporter_country": "China",
    "importer_country": "Canada",
    "product": "electronics",
    "tariff_percent": 25,
    "execution_time_ms": 248.1,
    "results": { ... }
  },
  ...
]
```

---

### 3. Compare Scenarios

**Endpoint:** `POST /compare`

Compare effects of multiple tariff scenarios side-by-side.

#### Request Body

```json
[
  {
    "exporter_country": "China",
    "importer_country": "Canada",
    "product": "electronics",
    "tariff_percent": 25
  },
  {
    "exporter_country": "China",
    "importer_country": "Canada",
    "product": "steel",
    "tariff_percent": 30
  }
]
```

#### Response

```json
{
  "scenarios_count": 2,
  "results": [
    { ... },
    { ... }
  ],
  "timestamp": "2026-03-07T12:34:56.789123"
}
```

---

### 4. Health Check

**Endpoint:** `GET /health`

Check if the API is running and responsive.

#### Response

```json
{
  "status": "healthy",
  "service": "TradeRipple Simulation Engine",
  "timestamp": "2026-03-07T12:34:56.789123"
}
```

---

### 5. Get Baseline Data

**Endpoint:** `GET /baseline?year=2024`

Retrieve baseline trade and economic data.

#### Query Parameters
- `year` (integer, optional): Baseline year (default: 2024)

#### Response

```json
{
  "year": 2024,
  "message": "Baseline data endpoint - implementation pending",
  "timestamp": "2026-03-07T12:34:56.789123"
}
```

---

### 6. Get Canada Statistics

**Endpoint:** `GET /canada-stats/{year}`

Retrieve Canada-specific statistics.

#### Path Parameters
- `year` (integer): Baseline year

#### Response

```json
{
  "year": 2024,
  "message": "Canada statistics endpoint - implementation pending",
  "timestamp": "2026-03-07T12:34:56.789123"
}
```

---

## CORS Configuration

The API includes CORS (Cross-Origin Resource Sharing) enabled for all origins, allowing the React frontend to make requests from any domain.

**Current Configuration:**
- `allow_origins`: `["*"]` (all origins)
- `allow_credentials`: `true`
- `allow_methods`: `["*"]` (all HTTP methods)
- `allow_headers`: `["*"]` (all headers)

**For Production:**
Restrict CORS to specific frontend domains:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com", "https://www.yourdomain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

---

## Performance

- **Typical Response Time**: < 1 second for standard queries
- **Execution Time Tracking**: Each response includes `execution_time_ms` for monitoring performance
- **Caching**: The SimulationEngine uses global caching to avoid reloading data files

### Performance Tips

1. Use the `/simulate_tariff` endpoint for single simulations
2. Use `/simulate_tariff/batch` for multiple scenarios to save connection overhead
3. Monitor `execution_time_ms` in responses to identify slow queries

---

## Data Requirements

The API expects CSV files in the `data/` directory:

### trade_flows.csv
```csv
exporter,importer,product,value_usd
China,Canada,electronics,120000000
USA,Canada,cars,150000000
...
```

**Required columns:**
- `exporter`: Source country
- `importer`: Destination country
- `product`: Product category
- `value_usd`: Trade value in USD

### industry_dependencies.csv
```csv
input_industry,dependent_industry,dependency_weight,supplier_countries
electronics,manufacturing,0.8,"China;Taiwan;Vietnam"
...
```

**Required columns:**
- `input_industry`: Input industry
- `dependent_industry`: Industry that depends on input
- `dependency_weight`: Weight of dependency (0-1)
- `supplier_countries`: Semicolon-separated list of suppliers

---

## Error Handling

All errors follow standard HTTP status codes and include descriptive messages:

- **200 OK**: Successful simulation
- **400 Bad Request**: Invalid input parameters
- **503 Service Unavailable**: Data files not found
- **500 Internal Server Error**: Unexpected server error

---

## Development

### Running in Development Mode

```bash
python run_server.py --reload
```

With auto-reload enabled, changes to code are reflected immediately without restarting the server.

### Debugging

Enable verbose logging:

```bash
uvicorn api.server:app --reload --log-level debug
```

---

## Production Deployment

For production deployment:

1. **Disable auto-reload:**
   ```bash
   python run_server.py --no-reload
   ```

2. **Use production ASGI server (gunicorn):**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker api.server:app
   ```

3. **Restrict CORS** to specific frontend domains

4. **Enable HTTPS** with SSL/TLS certificates

5. **Use environment variables** for configuration:
   ```bash
   export HOST=0.0.0.0
   export PORT=8000
   python run_server.py
   ```

---

## Support & Issues

For issues or questions about the API:

1. Check the interactive documentation at `/docs`
2. Review error messages and status codes
3. Monitor execution times in responses
4. Check server logs for detailed error information

---

## License

TradeRipple © 2026 - All Rights Reserved
