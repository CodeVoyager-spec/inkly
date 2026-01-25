const mongoose = require("mongoose");
const getEnv = require("./env");

const connectDB = async () => {
  mongoose.connect(getEnv("MONGO_URI"))
    .then(() => console.log("Connected"))
    .catch((err) => {
      console.error("Failed, retrying...", err.message);
      setTimeout(connect, 5000);
    });
};

module.exports = connectDB;
