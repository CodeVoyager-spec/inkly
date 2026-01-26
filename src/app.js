const express = require("express");
const authRouter = require("./routes/auth.routes");
const usersRouter = require("./routes/user.routes");
const profileRouter = require("./routes/profile.routes");
const postsRouter = require("./routes/post.routes");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to Inkly API...");
});

app.use("/inkly/api/v1/auth", authRouter);
app.use("/inkly/api/v1/users", usersRouter);
app.use("/inkly/api/v1/profile", profileRouter);
app.use("/inkly/api/v1/posts", postsRouter);

module.exports = app;
