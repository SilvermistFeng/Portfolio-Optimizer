import yfinance as yf
import pandas as pd
from typing import Dict, Any
from .adapter import MarketDataProvider

class YahooFinanceProvider(MarketDataProvider):
    """
    Implementation of MarketDataProvider using the yfinance library.
    Best for development and MVP (free, delayed data).
    """

    def get_historical_prices(self, tickers: list[str], period: str = "5y") -> pd.DataFrame:
        # yfinance download returns a MultiIndex if multiple tickers.
        # We want just the 'Adj Close' or 'Close'.
        # auto_adjust=True gives us adjusted close as 'Close'.
        data = yf.download(tickers, period=period, auto_adjust=True)
        
        if isinstance(data.columns, pd.MultiIndex):
            # If multi-index (Price, Ticker), extract Close and then just the tickers
            if 'Close' in data.columns:
                 return data['Close']
            # If auto_adjust=True, sometimes it just returns the prices directly if flattened
            # But yfinance 0.2+ structure can be complex.
            # Safer way:
            df = data['Close'] if 'Close' in data else data
            return df
        else:
            # Single ticker might return a DataFrame with columns like Open, High, Low, Close
            if 'Close' in data.columns:
                return data[['Close']].rename(columns={'Close': tickers[0]})
            return data

    def get_ticker_info(self, ticker: str) -> Dict[str, Any]:
        t = yf.Ticker(ticker)
        info = t.info
        return {
            "symbol": ticker,
            "name": info.get("longName"),
            "sector": info.get("sector"),
            "summary": info.get("longBusinessSummary")
        }
