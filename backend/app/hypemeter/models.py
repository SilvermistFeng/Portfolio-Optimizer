from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class Tip(BaseModel):
    ticker: str
    action: str # "BUY", "SELL"
    entry_date: date
    entry_price: Optional[float] = None
    valid_until: Optional[date] = None
    exit_date: Optional[date] = None
    exit_price: Optional[float] = None
    exit_price: Optional[float] = None
    comment: Optional[str] = None
    source_url: Optional[str] = None
    
    # Calculated fields
    return_pct: Optional[float] = None
    benchmark_return_pct: Optional[float] = None # S&P 500 return over same period

class Influencer(BaseModel):
    id: str
    name: str
    platform: str # "Twitter", "TV", "YouTube"
    handle: Optional[str] = None
    followers: Optional[int] = None
    image_url: Optional[str] = None
    
    # Classification
    category: str = "Stocks" # Stocks, Crypto, Shorts
    risk_level: str = "Medium" # Low, Medium, High, Extreme
    tags: List[str] = []
    
    # Stats
    reliability_score: float = 50.0 # 0-100
    rank: Optional[int] = None
    total_tips: int = 0
    success_rate: float = 0.0 # % of profitable tips
    average_return: float = 0.0
    
    tips: List[Tip] = []
