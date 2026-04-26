from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import RecommendationRequest
from .workflow.graph import workflow

app = FastAPI(title="Recommendation Microservice", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/recommend")
async def recommend(payload: RecommendationRequest) -> dict:
    location = payload.location.strip()
    if not location:
        raise HTTPException(status_code=400, detail="location is required")

    result = await workflow.ainvoke({
        "location": location,
        "pricing_raw": None,
        "trends_raw": None,
        "competitors_raw": None,
        "result": None,
        "error": None,
    })

    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])

    return result["result"]