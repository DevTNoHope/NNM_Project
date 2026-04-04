const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const routes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.set("trust proxy", 1);

app.use(cors({
    origin: function (origin, callback) {
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const allowedOrigins = [
            clientUrl,
            "http://localhost:5173",
            "http://localhost:4173",
        ];
        // Allow Vercel preview deployments (*.vercel.app)
        if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
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
