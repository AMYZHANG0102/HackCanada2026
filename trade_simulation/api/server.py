"""
FastAPI Server Module

Responsibilities:
- Define API endpoints for simulation requests
- Handle tariff scenario inputs from frontend
- Call simulation engine to run scenarios
- Format and return results as JSON
- Handle error cases and validation
- Support CORS for React frontend
"""

import sys
import os
import json
import time
from datetime import datetime
from functools import lru_cache
from typing import List, Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "simulation"))

from simulation_engine import SimulationEngine


# Initialize FastAPI app
app = FastAPI(
    title="TradeRipple Simulation Engine",
    description="API for tariff impact simulation and trade flow analysis",
    version="1.0.0"
)

# Add CORS middleware to support React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (restrict to specific domains in production)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Initialize simulation engine (singleton pattern)
_engine: Optional[SimulationEngine] = None


def get_engine() -> SimulationEngine:
    """Get or initialize the simulation engine."""
    global _engine
    if _engine is None:
        _engine = SimulationEngine()
        try:
            _engine.load_baseline_data()
        except Exception as e:
            print(f"Warning: Failed to load baseline data: {e}")
            # Continue without baseline - will use synthetic data
    return _engine


# ============================================================================
# Request/Response Models
# ============================================================================

class TariffSimulationRequest(BaseModel):
    """
    Request model for tariff scenario simulation.
    
    Example:
    {
        "exporter_country": "China",
        "importer_country": "Canada",
        "product": "electronics",
        "tariff_percent": 25,
        "elasticity": 0.6
    }
    """
    exporter_country: str = Field(..., description="Country exporting the product")
    importer_country: str = Field(..., description="Country importing the product")
    product: str = Field(..., description="Product category (e.g., electronics, cars, steel)")
    tariff_percent: float = Field(..., ge=0, le=500, description="Tariff rate as percentage")
    elasticity: Optional[float] = Field(0.6, ge=0.1, le=2.0, description="Price elasticity of demand")
    
    @validator("exporter_country", "importer_country", "product")
    def non_empty_string(cls, v):
        if not v or not v.strip():
            raise ValueError("Cannot be empty")
        return v.strip()


class SimulationResponse(BaseModel):
    """Response model for simulation results."""
    timestamp: str
    exporter_country: str
    importer_country: str
    product: str
    tariff_percent: float
    execution_time_ms: float
    results: Dict


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    service: str
    timestamp: str


class ErrorResponse(BaseModel):
    """Error response."""
    error: str
    details: Optional[str] = None
    timestamp: str


# ============================================================================
# Health & Utility Endpoints
# ============================================================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        Status confirmation with timestamp
    """
    return {
        "status": "healthy",
        "service": "TradeRipple Simulation Engine",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/")
async def root():
    """API root endpoint with documentation."""
    return {
        "name": "TradeRipple Simulation Engine",
        "version": "1.0.0",
        "documentation": "/docs",
        "endpoints": {
            "POST /simulate_tariff": "Run a single tariff impact simulation",
            "GET /health": "Health check"
        }
    }


# ============================================================================
# Simulation Endpoints
# ============================================================================

@app.post("/simulate_tariff", response_model=SimulationResponse)
async def simulate_tariff(request: TariffSimulationRequest):
    """
    Run a tariff impact simulation for a specific trade flow.
    
    This endpoint:
    1. Accepts exporter, importer, product, and tariff percentage
    2. Calls the SimulationEngine to calculate impacts
    3. Returns comprehensive results including trade changes, price effects, supply shifts, and Canada-specific impacts
    
    Performance: Typically returns results in <1 second
    
    Args:
        request: TariffSimulationRequest with country/product/tariff details
    
    Returns:
        SimulationResponse with detailed simulation results
    
    Example:
        POST /simulate_tariff
        {
            "exporter_country": "China",
            "importer_country": "Canada",
            "product": "electronics",
            "tariff_percent": 25,
            "elasticity": 0.6
        }
    """
    start_time = time.time()
    
    try:
        # Get simulation engine
        engine = get_engine()
        
        # Run simulation
        results = engine.run_simulation(
            exporter=request.exporter_country,
            importer=request.importer_country,
            product=request.product,
            tariff_percent=request.tariff_percent,
            elasticity=request.elasticity
        )
        
        # Calculate execution time
        execution_time_ms = (time.time() - start_time) * 1000
        
        # Return structured response
        return SimulationResponse(
            timestamp=datetime.utcnow().isoformat(),
            exporter_country=request.exporter_country,
            importer_country=request.importer_country,
            product=request.product,
            tariff_percent=request.tariff_percent,
            execution_time_ms=execution_time_ms,
            results=results
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid input: {str(e)}"
        )
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=503,
            detail="Data files not found. Please ensure CSV files are in the data directory."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Simulation error: {str(e)}"
        )


@app.post("/simulate_tariff/batch")
async def simulate_tariff_batch(requests: List[TariffSimulationRequest]):
    """
    Run multiple tariff impact simulations in batch.
    
    Useful for comparing scenarios or running parameter sweeps.
    
    Args:
        requests: List of TariffSimulationRequest objects
    
    Returns:
        List of SimulationResponse objects
    """
    try:
        engine = get_engine()
        results = []
        
        for req in requests:
            start_time = time.time()
            
            result = engine.run_simulation(
                exporter=req.exporter_country,
                importer=req.importer_country,
                product=req.product,
                tariff_percent=req.tariff_percent,
                elasticity=req.elasticity
            )
            
            execution_time_ms = (time.time() - start_time) * 1000
            
            results.append(SimulationResponse(
                timestamp=datetime.utcnow().isoformat(),
                exporter_country=req.exporter_country,
                importer_country=req.importer_country,
                product=req.product,
                tariff_percent=req.tariff_percent,
                execution_time_ms=execution_time_ms,
                results=result
            ))
        
        return results
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Batch simulation error: {str(e)}"
        )


# Placeholder endpoints for future expansion
@app.post("/compare")
async def compare_scenarios(scenarios: List[Dict]):
    """
    Compare multiple tariff scenarios.
    
    Returns:
        Comparative analysis across scenarios
    """
    try:
        engine = get_engine()
        comparison_results = []
        
        for scenario in scenarios:
            result = engine.run_simulation(
                exporter=scenario.get("exporter_country"),
                importer=scenario.get("importer_country"),
                product=scenario.get("product"),
                tariff_percent=scenario.get("tariff_percent", 0),
                elasticity=scenario.get("elasticity", 0.6)
            )
            comparison_results.append(result)
        
        return {
            "scenarios_count": len(scenarios),
            "results": comparison_results,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/baseline")
async def get_baseline_data(year: int = 2024):
    """
    Get baseline trade and economic data.
    
    Returns:
        Baseline statistics by country/product
    """
    return {
        "year": year,
        "message": "Baseline data endpoint - implementation pending",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/canada-stats/{year}")
async def get_canada_stats(year: int = 2024):
    """
    Get Canada-specific baseline statistics.
    
    Returns:
        Canada's trade, GDP, and industry data
    """
    return {
        "year": year,
        "message": "Canada statistics endpoint - implementation pending",
        "timestamp": datetime.utcnow().isoformat()
    }


# ============================================================================
# Server Startup
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    print("""
    ╔════════════════════════════════════════════════════════════════════╗
    ║           TradeRipple Simulation Engine - FastAPI Server           ║
    ║                    Starting on http://localhost:8000               ║
    ║                                                                    ║
    ║  API Documentation:  http://localhost:8000/docs                   ║
    ║  Alternative Docs:   http://localhost:8000/redoc                  ║
    ║                                                                    ║
    ║  Main Endpoint:      POST /simulate_tariff                        ║
    ║  Health Check:       GET /health                                  ║
    ║                                                                    ║
    ║  CORS enabled for React frontend access                           ║
    ╚════════════════════════════════════════════════════════════════════╝
    """)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
