import express from 'express';

const router = express.Router();
const FASTAPI_BASE_URL = ("stellar-commitment-production-af7c.up.railway.app");
const FASTAPI_TIMEOUT_MS = Number.parseInt(process.env.FASTAPI_TIMEOUT_MS || "25000", 10);

router.post("/", async (req, res) => {
  const location = String(req.body?.location || "").trim();
  if (!location) {
    return res.status(400).json({ error: "location is required" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FASTAPI_TIMEOUT_MS);

  try {
    const fastapiResponse = await fetch(`${FASTAPI_BASE_URL}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location }),
      signal: controller.signal,
    });

    const raw = await fastapiResponse.text();
    let payload = {};
    if (raw) {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = { error: "Invalid JSON from recommendation microservice" };
      }
    }

    if (!fastapiResponse.ok) {
      return res.status(fastapiResponse.status).json({
        error: payload?.detail || payload?.error || "Recommendation microservice error",
      });
    }

    return res.json(payload);
  } catch (err) {
    if (err?.name === "AbortError") {
      return res.status(504).json({ error: "Recommendation request timed out" });
    }
    console.error("POST /recommend error:", err);
    return res.status(500).json({ error: "Server error" });
  } finally {
    clearTimeout(timeout);
  }
});

export default router;
