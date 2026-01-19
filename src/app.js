const express = require("express");
const authRouter = require("./routes/auth.routes");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to Inkly API...");
});

app.use("/inkly/api/v1/auth", authRouter);

module.exports = app;

