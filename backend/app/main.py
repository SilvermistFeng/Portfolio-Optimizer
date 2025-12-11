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
    return optimizer.optimize_portfolio(request)
