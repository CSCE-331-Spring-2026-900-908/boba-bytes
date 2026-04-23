import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const lat = 30.6744;   // Bryan/College Station latitude
    const lon = -96.3698;  // Bryan/College Station longitude
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing WEATHER_API_KEY" });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    return res.json({
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      condition: data.weather[0].main,
      description: data.weather[0].description,
    });
  } catch (err) {
    console.error("Weather API error:", err);
    res.status(500).json({ error: "Weather fetch failed" });
  }
});

export default router;
