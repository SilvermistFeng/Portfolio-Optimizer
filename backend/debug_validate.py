import yfinance as yf

tickers = ["AAPL", "BTC-USD", "CRAZY_INVALID_TICKER"]

for t in tickers:
    print(f"\n--- Testing {t} ---")
    try:
        dat = yf.Ticker(t)
        hist = dat.history(period="1d")
        print(f"Empty? {hist.empty}")
        if not hist.empty:
            print(f"Close: {hist['Close'].iloc[-1]}")
        else:
            print("NO DATA returned")
    except Exception as e:
        print(f"ERROR: {e}")
