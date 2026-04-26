import json
import os
from datetime import datetime, timezone
from langchain_openai import ChatOpenAI
from langchain_community.tools.tavily_search import TavilySearchResults
from .state import ResearchState

search = TavilySearchResults(max_results=5)
llm = ChatOpenAI(
    model="protected.gemini-2.0-flash-lite",
    openai_api_key=os.environ["TAMU_API_KEY"],
    openai_api_base="https://chat-api.tamu.ai/openai",
    temperature=0.3,
)

# --- Research nodes (run in parallel via Send API) ---

def research_pricing(state: ResearchState) -> dict:
    loc = state["location"]
    results = search.invoke(f"bubble tea boba shop pricing menu prices {loc}")
    return {"pricing_raw": str(results)}


def research_trends(state: ResearchState) -> dict:
    loc = state["location"]
    results = search.invoke(f"bubble tea drink trends popular flavors {loc} 2024 2025")
    return {"trends_raw": str(results)}


def research_competitors(state: ResearchState) -> dict:
    loc = state["location"]
    results = search.invoke(f"boba tea shop competitors new openings {loc}")
    return {"competitors_raw": str(results)}


# --- Analysis + formatting node ---

SYSTEM_PROMPT = """
You are a bubble tea business analyst. Given raw web research, produce a JSON 
recommendation report. Respond ONLY with valid JSON matching this exact shape:

{
  "pricing": {
    "summary": "<string>",
    "insights": ["<string>", ...],
    "avgPrice": "<$X.XX>",
    "recommendation": "<string>"
  },
  "trends": {
    "summary": "<string>",
    "items": [
      {"title": "<string>", "description": "<string>", "type": "viral|health|seasonal"}
    ]
  },
  "menuSuggestions": [
    {
      "name": "<string>",
      "description": "<string>",
      "suggestedPrice": "<$X.XX>",
      "reason": "<string>",
      "category": "drink|topping|food"
    }
  ]
}
"""

def analyze_and_format(state: ResearchState) -> dict:
    user_msg = f"""
Location: {state["location"]}

PRICING RESEARCH:
{state.get("pricing_raw", "No data")}

TRENDS RESEARCH:
{state.get("trends_raw", "No data")}

COMPETITOR RESEARCH:
{state.get("competitors_raw", "No data")}

Produce the JSON recommendation report now.
"""
    response = llm.invoke([
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_msg},
    ])

    content = response.content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
        content = content.strip()

    if not content:
        raise ValueError("LLM returned empty response")

    parsed = json.loads(content)
    parsed["lastUpdated"] = datetime.now(timezone.utc).isoformat()
    return {"result": parsed}