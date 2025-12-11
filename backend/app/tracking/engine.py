from typing import List
import pandas as pd
from ..data.adapter import MarketDataProvider
from ..data.yahoo_adapter import YahooFinanceProvider
from .models import Holding, TrackingResult, PerformancePoint

class TrackingEngine:
    def __init__(self, provider: MarketDataProvider = YahooFinanceProvider()):
        self.provider = provider

    def analyze_portfolio(self, holdings: List[Holding]) -> TrackingResult:
        if not holdings:
            return TrackingResult(
                total_value=0, total_gain_loss=0, total_gain_loss_pct=0, 
                holdings=[], chart_data=[]
            )

        tickers = [h.ticker for h in holdings]
        # Get Current Data
        # For efficiency, we really should have a multi-ticker fetcher.
        # YahooAdapter's get_historical_prices works for this.
        
        # 1. Current Valuation
        # We'll fetch last 1 year to do both valuation and charting
        hist_data = self.provider.get_historical_prices(tickers + ['SPY'], period="1y")
        latest_prices = hist_data.iloc[-1]
        
        total_value = 0.0
        total_cost = 0.0
        
        updated_holdings = []
        
        for h in holdings:
            if h.ticker in latest_prices:
                price = latest_prices[h.ticker]
            else:
                price = h.avg_cost # Fallback
            
            h.current_price = round(price, 2)
            h.market_value = round(price * h.shares, 2)
            cost_basis = h.avg_cost * h.shares
            h.gain_loss = round(h.market_value - cost_basis, 2)
            h.gain_loss_pct = round(h.gain_loss / cost_basis, 4) if cost_basis > 0 else 0
            
            total_value += h.market_value
            total_cost += cost_basis
            updated_holdings.append(h)
            
        total_gain = total_value - total_cost
        total_gain_pct = total_gain / total_cost if total_cost > 0 else 0

        # 2. Charting (Backcast: "If I held this portfolio for the last year")
        # Normalize: Start at 100
        chart_data = []
        
        # Calculate daily portfolio value
        # Portfolio series = sum(shares * price_series)
        pf_series = pd.Series(0, index=hist_data.index)
        
        for h in holdings:
            if h.ticker in hist_data.columns:
                pf_series += hist_data[h.ticker] * h.shares
        
        # Benchmark (SPY) scaling
        spy_series = hist_data['SPY']
        
        # Normalize both to start at the same value (e.g. initial portfolio value)
        start_val = pf_series.iloc[0]
        spy_start = spy_series.iloc[0]
        
        if start_val > 0:
            scale_factor = start_val / spy_start
            scaled_spy = spy_series * scale_factor
        else:
            scaled_spy = spy_series # Fallback
            
        # Downsample for chart (weekly)
        resampled_pf = pf_series.resample('W').last()
        resampled_spy = scaled_spy.resample('W').last()
        
        for date, val in resampled_pf.items():
            spy_val = resampled_spy.loc[date] if date in resampled_spy.index else 0
            chart_data.append(PerformancePoint(
                date=date.strftime("%Y-%m-%d"),
                portfolio_value=round(val, 2),
                benchmark_value=round(spy_val, 2)
            ))

        return TrackingResult(
            total_value=round(total_value, 2),
            total_gain_loss=round(total_gain, 2),
            total_gain_loss_pct=round(total_gain_pct, 4),
            holdings=updated_holdings,
            chart_data=chart_data
        )
