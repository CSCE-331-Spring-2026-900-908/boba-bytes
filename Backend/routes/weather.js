import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing WEATHER_API_KEY" });
    }

    // College Station, TX (your location)
    const lat = 30.627977;
    const lon = -96.334406;

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
    

    const response = await fetch(url);
    const data = await response.json();

    res.json({
      temp: data.main?.temp,
      condition: data.weather?.[0]?.main,
      raw: data
    });

  } catch (err) {
    console.error("Weather error:", err);
    res.status(500).json({ error: "Weather fetch failed" });
  }
});

export default router;


