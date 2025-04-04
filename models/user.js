const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  organization: {
    type: String,
    // required: true,
  },
  jobTitle: {
    type: String,
    // required: true,
  },
  password: {
    type: String,
    // required: true,
  },
  role: {
    type: String,
    enum: ["owner", "admin", "user"],
    default: "user",
  },
  googleId: String,
});

const User = mongoose.model("User", UserSchema);

module.exports = User;

