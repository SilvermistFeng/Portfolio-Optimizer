from fastapi import APIRouter
from typing import List
from datetime import date
from .models import Influencer, Tip
from .engine import HypeMeterEngine

router = APIRouter(prefix="/hypemeter", tags=["hypemeter"])

# MOCK DATA STORE
mock_influencers = [
    Influencer(
        id="jim_cramer",
        name="Jim Cramer",
        platform="TV",
        handle="@jimcramer",
        image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Jim_Cramer_2010.jpg/440px-Jim_Cramer_2010.jpg",
        category="Stocks",
        risk_level="High",
        tags=["Tech", "Inverse"],
        tips=[
            Tip(ticker="NVDA", action="BUY", entry_date=date(2023, 1, 1), entry_price=14.0, comment="Ai is the future!", source_url="https://x.com/jimcramer/status/1600000"),
            Tip(ticker="META", action="SELL", entry_date=date(2022, 10, 1), entry_price=100.0, comment="Metaverse is dead.", source_url="https://cnbc.com/jim-cramer-meta"),
            Tip(ticker="AMD", action="BUY", entry_date=date(2023, 6, 15), entry_price=110.0, comment="Chip demand soaring", source_url="https://cnbc.com/mad-money"),
            Tip(ticker="NFLX", action="SELL", entry_date=date(2022, 5, 1), entry_price=190.0, comment="Streaming wars lost", source_url="https://twitter.com/jimcramer"),
            Tip(ticker="TSLA", action="BUY", entry_date=date(2023, 1, 5), entry_price=110.0, comment="Undervalued now", source_url="https://cnbc.com")
        ]
    ),
    Influencer(
        id="nancy_pelosi",
        name="Nancy Pelosi Tracker",
        platform="Gov",
        handle="@NancyTracker",
        image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Nancy_Pelosi_official_photo.jpg/440px-Nancy_Pelosi_official_photo.jpg",
        category="Stocks",
        risk_level="Medium",
        tags=["Tech", "Options"],
        tips=[
             Tip(ticker="PANW", action="BUY", entry_date=date(2024, 1, 20), entry_price=300.0, comment="Cybersecurity disclosure", source_url="https://clerk.house.gov/"),
             Tip(ticker="MSFT", action="BUY", entry_date=date(2023, 3, 10), entry_price=250.0, comment="AI Play", source_url="https://twitter.com/NancyTracker"),
             Tip(ticker="AAPL", action="BUY", entry_date=date(2022, 5, 20), entry_price=140.0, comment="Tech portfolio add", source_url="https://clerk.house.gov/"),
             Tip(ticker="NVDA", action="BUY", entry_date=date(2023, 11, 20), entry_price=480.0, comment="Senate trade", source_url="https://twitter.com/Politico")
        ]
    ),
    Influencer(
        id="roaring_kitty",
        name="Roaring Kitty",
        platform="Twitter",
        handle="@TheRoaringKitty",
        image_url="https://upload.wikimedia.org/wikipedia/en/8/87/Keith_Gill_%28Roaring_Kitty%29.png",
        category="Stocks", # Technically stocks but behaves like Crypto risk
        risk_level="Extreme",
        tags=["Meme", "GME", "YOLO"],
        tips=[
            Tip(ticker="GME", action="BUY", entry_date=date(2021, 1, 1), entry_price=5.0, comment="I like the stock", source_url="https://twitter.com/TheRoaringKitty/status/1344800000000000000"),
            Tip(ticker="AMD", action="BUY", entry_date=date(2023, 1, 1), valid_until=date(2023, 6, 1), entry_price=80.0, comment="Should pop by summer '23", source_url="https://x.com/TheRoaringKitty"),
            Tip(ticker="INTC", action="BUY", entry_date=date(2023, 1, 1), valid_until=date(2023, 4, 1), entry_price=30.0, comment="Quick rebound Q1", source_url="https://x.com/TheRoaringKitty"),
            Tip(ticker="CHWY", action="BUY", entry_date=date(2024, 6, 20), entry_price=25.0, comment="Dog Emoji Tweet", source_url="https://x.com/TheRoaringKitty/status/123999")
        ]
    ),
    Influencer(
        id="crypto_king",
        name="CryptoKing",
        platform="Twitter",
        handle="@moon_lambo",
        image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Bitcoin.png/64px-Bitcoin.png", # Placeholder
        category="Crypto",
        risk_level="Extreme",
        tags=["Memecoins", "Forex"],
        tips=[
            Tip(ticker="BTC-USD", action="BUY", entry_date=date(2023, 1, 1), entry_price=16000.0, comment="Bottom is in", source_url="https://twitter.com"),
            Tip(ticker="DOGE-USD", action="BUY", entry_date=date(2021, 5, 1), entry_price=0.50, comment="To the moon", source_url="https://twitter.com")
        ]
    ),
    Influencer(
        id="hindenburg",
        name="Hindenburg Research",
        platform="Web",
        handle="@HindenburgRes",
        image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Hindenburg_Research_Logo.png/640px-Hindenburg_Research_Logo.png", # Placeholder
        category="Shorts",
        risk_level="High",
        tags=["Shorts", "Fraud"],
        tips=[
            Tip(ticker="IEP", action="SELL", entry_date=date(2023, 5, 1), entry_price=30.0, comment="Ponzi structure", source_url="https://hindenburgresearch.com"),
            Tip(ticker="ADANI", action="SELL", entry_date=date(2023, 1, 24), entry_price=3000.0, comment="Accounting Fraud", source_url="https://hindenburgresearch.com")
        ]
    ),
    Influencer(
        id="value_vixen",
        name="ValueVixen",
        platform="Twitter",
        handle="@value_investing_daily",
        image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Warren_Buffett_KU_Visit.jpg/440px-Warren_Buffett_KU_Visit.jpg", # Placeholder/Mock
        category="Stocks",
        risk_level="Low",
        tags=["Dividends", "ETFs"],
        tips=[
            Tip(ticker="KO", action="BUY", entry_date=date(2023, 1, 1), entry_price=60.0, comment="Safe dividend", source_url="https://twitter.com"),
            Tip(ticker="VOO", action="BUY", entry_date=date(2023, 1, 1), entry_price=380.0, comment="Market bet", source_url="https://twitter.com")
        ]
    )
]

# Calculate initial scores
engine = HypeMeterEngine()
# First pass score
for inf in mock_influencers:
    engine.score_influencer(inf)

# Assign Ranks based on reliability score
# Sort descending
mock_influencers.sort(key=lambda x: x.reliability_score, reverse=True)
for i, inf in enumerate(mock_influencers):
    inf.rank = i + 1

@router.get("/influencers", response_model=List[Influencer])
def get_influencers():
    # Recalculate lively just in case (for MVP)
    # in prod we would cache this
    return mock_influencers

@router.get("/influencers/{id}", response_model=Influencer)
def get_influencer(id: str):
    for inf in mock_influencers:
        if inf.id == id:
            return inf
    return None
