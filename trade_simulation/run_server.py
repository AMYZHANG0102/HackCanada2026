#!/usr/bin/env python
"""
API Server Startup Script

Starts the TradeRipple FastAPI server on localhost:8000

Environment Variables:
  HOST: Server host (default: 0.0.0.0)
  PORT: Server port (default: 8000)
  RELOAD: Enable auto-reload on code changes (default: True in dev)

Usage:
  python run_server.py              # Start with defaults
  python run_server.py --no-reload  # Start without auto-reload
  python run_server.py --host 127.0.0.1 --port 5000  # Custom host/port
"""

import sys
import os
import argparse
from pathlib import Path

# Add the parent directory to path so we can import the api module
sys.path.insert(0, str(Path(__file__).parent))

import uvicorn
from api.server import app


def main():
    parser = argparse.ArgumentParser(
        description="Start the TradeRipple API Server"
    )
    parser.add_argument(
        "--host",
        type=str,
        default=os.getenv("HOST", "0.0.0.0"),
        help="Server host address (default: 0.0.0.0)"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.getenv("PORT", "8000")),
        help="Server port number (default: 8000)"
    )
    parser.add_argument(
        "--reload",
        type=bool,
        default=True,
        help="Enable auto-reload on code changes (default: True)"
    )
    parser.add_argument(
        "--no-reload",
        action="store_true",
        help="Disable auto-reload"
    )
    
    args = parser.parse_args()
    reload = not args.no_reload
    
    print(f"\n{'='*70}")
    print("TradeRipple Simulation Engine - FastAPI Server")
    print(f"{'='*70}")
    print(f"Server starting on http://{args.host}:{args.port}")
    print(f"API Documentation: http://{args.host}:{args.port}/docs")
    print(f"Auto-reload: {'Enabled' if reload else 'Disabled'}")
    print(f"{'='*70}\n")
    
    uvicorn.run(
        app,
        host=args.host,
        port=args.port,
        reload=reload,
        log_level="info"
    )


if __name__ == "__main__":
    main()
