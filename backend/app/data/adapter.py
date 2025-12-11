from abc import ABC, abstractmethod
import pandas as pd
from typing import Dict, Any

class MarketDataProvider(ABC):
    """
    Abstract Interface for fetching market data.
    Allows swapping between Yahoo Finance, Alpaca, Polygon, etc.
    """

    @abstractmethod
    def get_historical_prices(self, tickers: list[str], period: str = "5y") -> pd.DataFrame:
        """
        Fetch historical close prices for a list of tickers.
        Returns a DataFrame where columns are Tickers and Index is Date.
        """
        pass

    @abstractmethod
    def get_ticker_info(self, ticker: str) -> Dict[str, Any]:
        """
        Get metadata for a ticker (name, sector, summary).
        """
        pass
