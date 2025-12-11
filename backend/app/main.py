from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Portfolio Optimizer API", version="0.1.0")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Portfolio Optimizer API is running"}

from .core.optimization import PortfolioOptimizer, OptimizationRequest, OptimizationResult
from .hypemeter.router import router as hypemeter_router
from .tracking.router import router as tracking_router

app.include_router(hypemeter_router)
app.include_router(tracking_router)

@app.post("/optimize", response_model=OptimizationResult)
def optimize_portfolio(request: OptimizationRequest):
    optimizer = PortfolioOptimizer()
    try:
        return optimizer.optimize_portfolio(request)
    except ValueError as e:
        # User error (invalid tickers, empty list)
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Unexpected error
        from fastapi import HTTPException
        print(f"Optimization Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Optimization Error")
