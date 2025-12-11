from fastapi import APIRouter, HTTPException
from .models import PortfolioRequest, TrackingResult, RebalanceRequest
from .engine import TrackingEngine

router = APIRouter(prefix="/tracking", tags=["tracking"])

@router.post("/analyze", response_model=TrackingResult)
def analyze_portfolio(request: PortfolioRequest):
    engine = TrackingEngine()
    try:
        return engine.analyze_portfolio(request.holdings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rebalance")
def rebalance_portfolio(request: RebalanceRequest):
    engine = TrackingEngine()
    try:
        orders = engine.generate_rebalancing_orders(
            request.holdings,
            request.target_weights,
            request.investment_amount
        )
        return {"orders": orders}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
