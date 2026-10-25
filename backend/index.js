
const dns = require("node:dns");

// Configure DNS before connecting to MongoDB Atlas
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectToMongo = require("./db");

const app = express();
const port = Number(process.env.PORT) || 5000;

const allowedOrigins = (
  process.env.CLIENT_ORIGIN || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

// Middleware
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "auth-token"],
  })
);

app.use(express.json({ limit: "1mb" }));

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "iNotebook API",
  });
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

// API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

// Error-handling middleware
app.use((err, _req, res, _next) => {
  console.error("API error:", err.message);

  res.status(500).json({
    error: "Unexpected server error",
  });
});

// Connect to MongoDB, then start the server
connectToMongo()
  .then(() => {
    app.listen(port, () => {
      console.log(
        `iNotebook API listening at http://localhost:${port}`
      );
    });
  })
  .catch((error) => {
    console.error(
      "Could not connect to MongoDB:",
      error.message
    );

    process.exit(1);
  });
