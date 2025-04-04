const mongoose = require("mongoose");

require("dotenv").config();

const mongoURI = process.env.DB_URI;

module.exports = async function connectDB() {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed");
    console.error(error);
  }
};
