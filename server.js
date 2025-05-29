const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Basic CORS setup with specific options for development
app.use(
  cors({
    origin: true, // Allow all origins during development to avoid CORS issues
    methods: ["GET"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Accept"],
  })
);

// to Serve static files from the public directory , this is standard
app.use(express.static(path.join(__dirname, "public")));

// API endpoint to fetch upcoming matches
app.get("/api/matches", async (req, res) => {
  try {
    if (!process.env.FOOTBALL_DATA_API_KEY) {
      console.error("API key is missing");
      return res.status(500).json({
        error: "Server configuration error",
        details: "API key is not configured",
      });
    }

    console.log("Fetching matches from football-data.org...");
    const today = new Date();
    const tenDaysFromNow = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    const dateFrom = today.toISOString().slice(0, 10);
    const dateTo = tenDaysFromNow.toISOString().slice(0, 10);

    const response = await axios.get(
      "https://api.football-data.org/v4/matches",
      {
        params: {
          status: "SCHEDULED",
          dateFrom,
          dateTo,
          limit: 10,
        },
        headers: {
          "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY,
          Accept: "application/json",
        },
      }
    );

    if (!response.data) {
      throw new Error("No data received from API");
    }

    console.log(
      "Successfully fetched matches. Response data:",
      JSON.stringify(response.data, null, 2)
    );

    // Ensure we're sending the correct data structure for fetching
    const matches = response.data.matches || [];
    res.setHeader("Content-Type", "application/json");
    res.json({ matches });
  } catch (error) {
    console.error("API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    res.status(error.response?.status || 500).json({
      error: "Failed to fetch matches",
      details: error.response?.data?.message || error.message,
    });
  }
});

// Serve index.html for the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/hybridaction/zybTrackerStatisticsAction", (req, res) => {
  const { data, __callback__ } = req.query;

  // Log the received query parameters
  console.log("Received data:", data);
  console.log("Callback function:", __callback__);

  // If a callback is provided, return a JSONP response
  if (__callback__) {
    const responseData = { message: "This route is under construction." };
    const jsonpResponse = `${__callback__}(${JSON.stringify(responseData)})`;
    res.setHeader("Content-Type", "application/javascript");
    return res.send(jsonpResponse);
  }

  // Default JSON response
  res.json({ message: "This route is under construction." });
});
app.get("/hybridaction/zybTrackerStatisticsAction", (req, res) => {
  const { data } = req.query;

  // Log the received query parameters
  console.log("Received data:", data);

  // Always return a JSON response
  res.json({ message: "This route is under construction." });
});
// New route for zybTrackerStatisticsAction
app.get("/hybridaction/zybTrackerStatisticsAction", (req, res) => {
  res.json({ message: "This route is under construction." });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    error: "Internal server error",
    details: err.message,
  });
});

// Start server with error handling
const server = app
  .listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log("API Key configured:", !!process.env.FOOTBALL_DATA_API_KEY);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${port} is already in use. Please try a different port.`
      );
      process.exit(1);
    } else {
      console.error("Server error:", err);
    }
  });
