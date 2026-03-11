const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const routes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Mount routes
app.use("/api", routes);

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;