import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import weatherRoute from "./routes/weather.js";

import employees from "./routes/employees.js";
import menu from "./routes/menu.js";
import inventory from "./routes/inventory.js";
import reports from "./routes/reports.js";
import kiosk_orders from "./routes/kiosk_orders.js";
import orders from "./routes/orders.js";
import login from "./routes/login.js";
import chatbotRouter from './routes/chatbot.js';
import recommend from './routes/recommend.js';

const app = express();
app.use(cors({
    origin: ["http://localhost:5173", "https://boba-bytes-production.up.railway.app", "https://boba-bytes.vercel.app"],
    credentials: true
}));



app.use(express.json());

app.use("/api/employees", employees);
app.use("/api/menu", menu);
app.use("/api/inventory", inventory);
app.use("/api/reports", reports);
app.use("/api/kiosk_orders", kiosk_orders);
app.use("/api/orders", orders);
app.use("/api/login", login);
app.use('/api/chatbot', chatbotRouter);
app.use('/api/recommend', recommend);
app.use("/weather", weatherRoute);
app.listen(3001, () => console.log("Backend running on port 3001"));
