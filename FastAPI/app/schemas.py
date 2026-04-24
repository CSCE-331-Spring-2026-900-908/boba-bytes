from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    location: str = Field(..., min_length=2, max_length=120)

