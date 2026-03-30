import express from "express";
import cors from "cors";

import employees from "./routes/employees.js";
import menu from "./routes/menu.js";
import inventory from "./routes/inventory.js";
import reports from "./routes/reports.js";
import orders from "./routes/orders.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/employees", employees);
app.use("/api/menu", menu);
app.use("/api/inventory", inventory);
app.use("/api/reports", reports);
app.use("/api/orders", orders);

app.listen(3001, () => console.log("Backend running on port 3001"));
