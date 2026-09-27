const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
require("dotenv").config();

const app = express();

// Allowed origins for CORS (Development & Production)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    // In development or if origin matches allowed list
    if (process.env.NODE_ENV !== "production" || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Also allow preview deployments on Vercel if configured
    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    return callback(new Error("CORS policy violation: Access from this origin is not allowed."));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Service Info
app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    service: "Jewelora API",
    version: "1.0.0",
    documentation: "/api/health"
  });
});


// Production Health Check Endpoint (No authentication required)
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "ok",
      service: "Jewelora API",
      database: "connected"
    });
  } catch (err) {
    res.status(503).json({
      status: "degraded",
      service: "Jewelora API",
      database: "disconnected",
      message: process.env.NODE_ENV === "production" ? "Database connection unavailable" : err.message
    });
  }
});

// API Routes
app.use("/api/jewellery", require("./routes/jewellery"));
app.use("/api/customers", require("./routes/customers"));
app.use("/api/suppliers", require("./routes/suppliers"));
app.use("/api/purchases", require("./routes/purchases"));
app.use("/api/sales", require("./routes/sales"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/reports", require("./routes/reports"));

// 404 handler for unmatched API routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({
      success: false,
      message: `API endpoint ${req.method} ${req.path} not found`
    });
  }
  next();
});

// Serve frontend static build if client/dist exists
const path = require("path");
const fs = require("fs");
const clientDist = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(clientDist, "index.html"));
    }
    next();
  });
}



// Production Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[Server Error] ${err.message}`);
  const isProd = process.env.NODE_ENV === "production";
  
  res.status(err.status || 500).json({
    success: false,
    message: isProd ? "Unable to process request" : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Jewelora] Server listening on port ${PORT}`);
});
