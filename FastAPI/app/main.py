from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import RecommendationRequest

app = FastAPI(title="Recommendation Microservice", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _build_response(location: str) -> dict:
    normalized = location.strip()
    return {
        "pricing": {
            "summary": f"Competitive pricing data for {normalized} should be refreshed before weekly pricing updates.",
            "insights": [
                "Local specialty drinks usually cluster within a narrow premium range.",
                "Bundle add-ons convert better than raising base drink price.",
                "Seasonal launches perform best with limited-time anchor pricing.",
            ],
            "avgPrice": "$5.75",
            "recommendation": "Keep core milk teas within $5.25-$5.95 and use toppings to lift average ticket.",
        },
        "trends": {
            "summary": "Fruit-forward and functional add-ins remain strong trend drivers.",
            "items": [
                {
                    "title": "Yogurt fruit tea hybrids",
                    "description": "Bright fruit flavors with creamy texture are highly shareable online.",
                    "type": "viral",
                },
                {
                    "title": "Low-sugar customization",
                    "description": "Customers increasingly request 25% and 50% sugar defaults.",
                    "type": "health",
                },
            ],
        },
        "menuSuggestions": [
            {
                "name": "Mango Yogurt Jasmine",
                "description": "Jasmine tea with mango puree and yogurt foam.",
                "suggestedPrice": "$6.25",
                "reason": "Fits current social trend mix of fruit + creamy texture.",
                "category": "drink",
            },
            {
                "name": "Honey Aloe Topping",
                "description": "Lightly sweet aloe topping for fruit teas.",
                "suggestedPrice": "$0.90",
                "reason": "Adds margin while supporting low-sugar positioning.",
                "category": "topping",
            },
        ],
        "lastUpdated": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/recommend")
def recommend(payload: RecommendationRequest) -> dict:
    location = payload.location.strip()
    if not location:
        raise HTTPException(status_code=400, detail="location is required")
    return _build_response(location)

