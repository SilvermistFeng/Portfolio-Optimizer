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
        image_url="https://ui-avatars.com/api/?name=Jim+Cramer&background=red&color=fff",
        tips=[
            Tip(ticker="NVDA", action="BUY", entry_date=date(2023, 1, 1), entry_price=14.0, comment="Ai is the future!"),
            Tip(ticker="META", action="SELL", entry_date=date(2022, 10, 1), entry_price=100.0, comment="Metaverse is dead.")
        ]
    ),
    Influencer(
        id="nancy_pelosi",
        name="Nancy Pelosi Tracker",
        platform="Gov",
        handle="@NancyTracker",
        image_url="https://ui-avatars.com/api/?name=Nancy+Pelosi&background=blue&color=fff",
        tips=[
             Tip(ticker="PANW", action="BUY", entry_date=date(2024, 1, 20), entry_price=300.0, comment="Cybersecurity disclosure")
        ]
    ),
    Influencer(
        id="roaring_kitty",
        name="Roaring Kitty",
        platform="Twitter",
        handle="@TheRoaringKitty",
        image_url="https://ui-avatars.com/api/?name=Roaring+Kitty&background=green&color=fff",
        tips=[
            Tip(ticker="GME", action="BUY", entry_date=date(2021, 1, 1), entry_price=5.0, comment="I like the stock")
        ]
    )
]

# Calculate initial scores
engine = HypeMeterEngine()
for inf in mock_influencers:
    engine.score_influencer(inf)

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
