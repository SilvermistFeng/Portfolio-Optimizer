from typing import List
from datetime import date
from ..data.adapter import MarketDataProvider
from ..data.yahoo_adapter import YahooFinanceProvider
from .models import Influencer, Tip

class HypeMeterEngine:
    def __init__(self, provider: MarketDataProvider = YahooFinanceProvider()):
        self.provider = provider

    def calculate_tip_performance(self, tip: Tip) -> Tip:
        """
        Calculates the performance of a single tip.
        Fetches current price if exit_price is missing.
        Fetches SPY price for benchmark comparison.
        """
        # 1. Fetch Entry/Current Price
        # If entry_price is missing, we need to fetch historical data (not implemented in MVP fully efficiently)
        # For now, assume entry_price is provided or we fetch "current" if needed.
        
        tickers = [tip.ticker, "SPY"]
        prices = self.provider.get_historical_prices(tickers, period="max") # Inefficent query for just one date, optimizing later
        
        # Logic placeholder:
        # entry_val = prices.loc[tip.entry_date][tip.ticker]
        # current_val = prices.iloc[-1][tip.ticker]
        
        # Simple Mock Logic for MVP until we do full date-index matching
        current_data = self.provider.get_historical_prices([tip.ticker])
        if not current_data.empty:
            # iloc[-1] gives the last row (Series). Access the ticker column to get value.
            current_price = float(current_data.iloc[-1][tip.ticker])
        else:
            current_price = 0.0
        
        if tip.entry_price is None or tip.entry_price == 0:
             # Fallback assumption for demo
             tip.entry_price = current_price * 0.9 # Assume 10% gain for demo
        
        start_val = tip.entry_price
        end_val = tip.exit_price if tip.exit_price else current_price
        
        if start_val > 0:
            raw_return = (end_val - start_val) / start_val
            tip.return_pct = round(raw_return, 4)
        else:
            tip.return_pct = 0.0

        # Invert return if it was a SELL recommendation
        if tip.action.upper() == "SELL":
            tip.return_pct = -tip.return_pct

        return tip

    def score_influencer(self, influencer: Influencer) -> Influencer:
        """
        Aggregates tip performance to update Influencer stats.
        """
        if not influencer.tips:
            return influencer
            
        total_return = 0.0
        wins = 0
        
        for i, tip in enumerate(influencer.tips):
            # Calculate individual tip stats
            updated_tip = self.calculate_tip_performance(tip)
            influencer.tips[i] = updated_tip
            
            if updated_tip.return_pct > 0:
                wins += 1
            total_return += updated_tip.return_pct
            
        influencer.total_tips = len(influencer.tips)
        influencer.success_rate = round(wins / influencer.total_tips, 2)
        influencer.average_return = round(total_return / influencer.total_tips, 4)
        
        # Reliability Score Formula (Simple):
        # Base 50 + (WinRate * 20) + (AvgReturn * 100)
        # 50% win rate + 0% return = 60 score
        score = 50 + (influencer.success_rate * 20) + (influencer.average_return * 50)
        influencer.reliability_score = min(100, max(0, round(score)))
        
        return influencer
