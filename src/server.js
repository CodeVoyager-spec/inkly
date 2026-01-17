require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to CMS API 🚀");
});

// Start server after DB connection
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
