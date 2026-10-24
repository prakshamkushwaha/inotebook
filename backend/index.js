require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectToMongo = require("./db");

const app = express();
const port = Number(process.env.PORT) || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",").map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "auth-token"]
}));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => res.json({ status: "ok", service: "iNotebook API" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(500).json({ error: "Unexpected server error" });
});

connectToMongo().then(() => {
  app.listen(port, () => console.log(`iNotebook API listening at http://localhost:${port}`));
}).catch((error) => {
  console.error("Could not connect to MongoDB:", error.message);
  process.exit(1);
});
