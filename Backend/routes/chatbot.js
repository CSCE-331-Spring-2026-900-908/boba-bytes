import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

async function getWeather() {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    const lat = 30.627977;
    const lon = -96.334406;

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;


    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    if (!data?.main || !Array.isArray(data.weather) || !data.weather[0]) {
      return null;
    }

    return {
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      description: data.weather[0].description
    };
  } catch (err) {
    return null;
  }
}


router.post('/', async (req, res) => {
  try {
    const { messages, menu } = req.body;
    const weather = await getWeather();

    const systemPrompt = `
You are Boba Buddy, a friendly drink recommendation assistant for a boba shop kiosk called Boba Bytes.

You MUST:
- Use ONLY the drinks from the provided menu JSON.
- Consider weather and season when recommending drinks.
- Respect ALL allergies and diet restrictions mentioned by the customer.
- Ask clarifying questions if allergies or diets are ambiguous.
- Keep answers short, clear, and kiosk-friendly (2–4 sentences).

Allergies you must handle:
- Dairy, Gluten, Nuts, Soy, Caffeine, Fruit, Gelatin.
- If the user mentions halal, avoid gelatin and non-halal ingredients.
- If the user mentions "no caffeine", avoid tea and coffee-based drinks.

Diets you must handle:
- Vegan, Vegetarian, Low-sugar, Sugar-free, Keto, Halal, Kosher.
- Vegan: no dairy, no gelatin, no animal products.
- Halal: avoid gelatin and non-halal ingredients.
- Low-sugar / Sugar-free: prefer fruit teas without added sugar, or suggest lower sugar options.

Weather and season:
- Hot weather: suggest iced, refreshing, fruity, or green tea-based drinks.
- Cold weather: suggest creamy, warm, or richer milk teas.
- Summer: fruity, citrus, tropical flavors.
- Winter: brown sugar, taro, matcha, classic milk teas.

Menu JSON will be provided in a separate message. Use it to reference drink names and types.
Never invent drinks that are not on the menu.
    `.trim();

    const menuMessage = {
      role: 'system',
      content: `Here is the menu JSON:\n${JSON.stringify(menu)}`
    };

    const weatherMessage = {
      role: 'system',
      content: weather
        ? `Current local weather at the kiosk: ${Math.round(weather.temp)}F, feels like ${Math.round(weather.feels_like)}F, condition: ${weather.description}. Use this as a strong signal when selecting drink styles.`
        : 'Current local weather is unavailable. Do not assume specific weather conditions; ask the user whether it is hot or cold if needed.'
    };

    const tamuResponse = await fetch(
        `${process.env.TAMUS_AI_CHAT_API_ENDPOINT}/api/chat/completions`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.TAMU_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "protected.gemini-2.0-flash-lite",   // or any model from /api/models
            stream: false,
            messages: [
              { role: "system", content: systemPrompt },
              menuMessage,
              weatherMessage,
              ...messages
            ]
          })
        }
    );

    const completion = await tamuResponse.json();
    const replyText = completion.choices[0].message.content;
    res.json({
      reply: {
        role: 'assistant',
        content: replyText
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      reply: {
        role: 'assistant',
        content: 'Sorry, I had trouble answering. Please try again.'
      }
    });
  }
});


export default router;
