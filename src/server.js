require("dotenv").config();
const app = require("./app");
const getEnv = require("./config/env");
const connectDB = require("./db");

const PORT = getEnv("PORT", 3000);

const startServer = async () => {
  await connectDB(); 
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();

