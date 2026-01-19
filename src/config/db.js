const mongoose = require("mongoose");
const getEnv = require("./env");

const MONGO_URI = getEnv("MONGO_URI");

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection failed", error);
    process.exit(1);
  }
};

module.exports = connectDB;
