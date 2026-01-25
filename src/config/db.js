const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected"))
    .catch((err) => {
      console.error("Failed, retrying...", err.message);
      setTimeout(connect, 5000);
    });
};

module.exports = connectDB;
