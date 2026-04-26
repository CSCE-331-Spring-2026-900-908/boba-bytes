from typing import TypedDict, Optional

class ResearchState(TypedDict):
    location: str
    pricing_raw: Optional[str]
    trends_raw: Optional[str]
    competitors_raw: Optional[str]
    result: Optional[dict]
    error: Optional[str]