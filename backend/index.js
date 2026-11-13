
const dns = require("node:dns");
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");

const connectToMongo = require("./db");
const authRoutes = require("./routes/auth");
const notesRoutes = require("./routes/notes");

dotenv.config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
const port = Number(process.env.PORT) || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://inotebook-fvju-d0vj5l04f-praksham-dev.vercel.app",
  ...(process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("Blocked CORS origin:", origin);
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "auth-token", "Authorization"]
}));

app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "iNotebook API" });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

app.use((err, _req, res, _next) => {
  console.error("API error:", err.message);
  res.status(500).json({ error: "Unexpected server error" });
});

connectToMongo()
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`iNotebook API listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Could not connect to MongoDB:", error.message);
    process.exit(1);
  });
