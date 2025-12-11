from fastapi import APIRouter, HTTPException
from .models import PortfolioRequest, TrackingResult
from .engine import TrackingEngine

router = APIRouter(prefix="/tracking", tags=["tracking"])

@router.post("/analyze", response_model=TrackingResult)
def analyze_portfolio(request: PortfolioRequest):
    engine = TrackingEngine()
    try:
        return engine.analyze_portfolio(request.holdings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
