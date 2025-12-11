from app.core.optimization import PortfolioOptimizer, OptimizationRequest

cases = [
    # Case 1: Standard (Worked)
    OptimizationRequest(tickers=["SPY", "BND"], risk_appetite=0.5, investment_amount=1000, time_horizon_years=5),
    # Case 2: Single Ticker
    OptimizationRequest(tickers=["SPY"], risk_appetite=0.5, investment_amount=1000, time_horizon_years=5),
    # Case 3: Invalid Ticker
    OptimizationRequest(tickers=["INVALID_TICKER_XYZ"], risk_appetite=0.5, investment_amount=1000, time_horizon_years=5),
    # Case 4: Empty
    OptimizationRequest(tickers=[], risk_appetite=0.5, investment_amount=1000, time_horizon_years=5),
]

opt = PortfolioOptimizer()

for i, req in enumerate(cases):
    print(f"\n--- Running Case {i+1}: {req.tickers} ---")
    try:
        res = opt.optimize_portfolio(request=req)
        print("Success")
    except Exception as e:
        print(f"FAILED Case {i+1}")
        import traceback
        traceback.print_exc()

