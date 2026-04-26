from pydantic import BaseModel
from typing import List, Optional


class PricingInsights(BaseModel):
    summary: str
    insights: List[str]
    avgPrice: str
    recommendation: str


class TrendItem(BaseModel):
    title: str
    description: str
    type: str


class Trends(BaseModel):
    summary: str
    items: List[TrendItem]


class MenuSuggestion(BaseModel):
    name: str
    description: str
    suggestedPrice: str
    reason: str
    category: str


class RecommendationResponse(BaseModel):
    pricing: PricingInsights
    trends: Trends
    menuSuggestions: List[MenuSuggestion]
    lastUpdated: str


class RecommendationRequest(BaseModel):
    location: str
