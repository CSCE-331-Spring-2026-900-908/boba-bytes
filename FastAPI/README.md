# FastAPI Recommendation Microservice

## Endpoints
- `GET /health`
- `POST /recommend`

### Request body
```json
{ "location": "Austin, TX" }
```

## Run locally
```bash
cd FastAPI
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

