from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class Holding(BaseModel):
    ticker: str
    shares: float
    avg_cost: float
    current_price: Optional[float] = None
    market_value: Optional[float] = None
    gain_loss: Optional[float] = None
    gain_loss_pct: Optional[float] = None

class PortfolioRequest(BaseModel):
    holdings: List[Holding]

class PerformancePoint(BaseModel):
    date: str # YYYY-MM-DD
    portfolio_value: float
    benchmark_value: float # Normalized to portfolio start value

class TrackingResult(BaseModel):
    total_value: float
    total_gain_loss: float
    total_gain_loss_pct: float
    holdings: List[Holding]
    chart_data: List[PerformancePoint]
