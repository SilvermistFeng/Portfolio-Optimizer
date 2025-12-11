from pydantic import BaseModel
from typing import List, Dict, Optional
import pandas as pd
import numpy as np
from scipy.optimize import minimize
from ..data.adapter import MarketDataProvider
from ..data.yahoo_adapter import YahooFinanceProvider

class OptimizationRequest(BaseModel):
    tickers: List[str]
    risk_appetite: float # 0.0 (Low risk) to 1.0 (High risk)
    investment_amount: float
    time_horizon_years: int

class OptimizationResult(BaseModel):
    weights: Dict[str, float]
    allocation: Dict[str, int]
    expected_return: float
    volatility: float
    sharpe_ratio: float
    leftover_cash: float

class PortfolioOptimizer:
    def __init__(self, provider=YahooFinanceProvider()):
        self.provider = provider
        self.risk_free_rate = 0.02 # Assumption for MVP

    def optimize_portfolio(self, request: OptimizationRequest) -> OptimizationResult:
        # 1. Fetch Data
        df = self.provider.get_historical_prices(request.tickers)
        
        # 2. Calculate Expected Returns and Covariance
        # annualized returns
        mu = df.pct_change().mean() * 252
        S = df.pct_change().cov() * 252

        # 3. Optimization Logic (Generic SciPy)
        num_assets = len(mu)
        args = (mu, S, self.risk_free_rate)
        
        # Constraints: Sum of weights = 1
        constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1})
        
        # Bounds: 0 <= weight <= 1
        bounds = tuple((0.0, 1.0) for asset in range(num_assets))
        
        # Initial Expectation: Equal weights
        init_guess = num_assets * [1. / num_assets,]

        # Objective Function: Negative Sharpe Ratio (to minimize)
        def neg_sharpe_ratio(weights, mu, S, rf):
            p_ret = np.sum(weights * mu)
            p_vol = np.sqrt(np.dot(weights.T, np.dot(S, weights)))
            return - (p_ret - rf) / p_vol
        
        # Objective Function: Volatility (for low risk users)
        def portfolio_volatility(weights, mu, S, rf):
            return np.sqrt(np.dot(weights.T, np.dot(S, weights)))

        # Select Objective based on Risk Appetite
        # High Risk (> 0.7) -> Max Portfolio Return (Not implemented solely, usually max Sharpe is best)
        # Low Risk (< 0.3) -> Min Volatility
        # Medium -> Max Sharpe
        
        if request.risk_appetite < 0.3:
            result = minimize(portfolio_volatility, init_guess, args=(mu, S, self.risk_free_rate), 
                              method='SLSQP', bounds=bounds, constraints=constraints)
        else:
             # Default to Max Sharpe
            result = minimize(neg_sharpe_ratio, init_guess, args=(mu, S, self.risk_free_rate), 
                              method='SLSQP', bounds=bounds, constraints=constraints)
            
        cleaned_weights = {ticker: round(weight, 4) for ticker, weight in zip(mu.index, result.x)}
        
        # 4. Discrete Allocation & Stats
        # Recalculate stats for the optimized weights
        opt_weights = result.x
        exp_ret = np.sum(opt_weights * mu)
        vol = np.sqrt(np.dot(opt_weights.T, np.dot(S, opt_weights)))
        sharpe = (exp_ret - self.risk_free_rate) / vol

        # Simple greedy allocation
        latest_prices = df.iloc[-1]
        allocation = {}
        cash = request.investment_amount
        
        # Sort by weight desc to prioritize big chunks
        sorted_tickers = sorted(cleaned_weights.keys(), key=lambda x: cleaned_weights[x], reverse=True)
        
        for ticker in sorted_tickers:
            target_val = request.investment_amount * cleaned_weights[ticker]
            price = latest_prices[ticker]
            if price > 0:
                shares = int(target_val // price)
                allocation[ticker] = shares
                cash -= (shares * price)
            else:
                allocation[ticker] = 0

        return OptimizationResult(
            weights=cleaned_weights,
            allocation=allocation,
            expected_return=round(exp_ret, 4),
            volatility=round(vol, 4),
            sharpe_ratio=round(sharpe, 4),
            leftover_cash=round(cash, 2)
        )
