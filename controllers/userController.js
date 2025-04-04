const User = require("../models/user");

// Profile controller
exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("_id fullName email role"); // Include user ID
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// Get users controller
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").limit(5);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Change role controller
exports.changeRole = async (req, res) => {
  const { userId, role } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.role = role;
    await user.save();
    res.json(user);
  }
  catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Search users controller
exports.searchUsers = async (req, res) => {
  const { name } = req.query;

  try {
    // Ensure the name is provided
    if (!name) {
      return res.status(400).json({ message: "Name is required for search" });
    }

    // Case-insensitive search
    const users = await User.find({
      fullName: { $regex: name, $options: "i" },
    }).select("-password -googleId"); // Exclude sensitive fields

    // If no users are found, send an appropriate response
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Send the matched users as response
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in searchUsers:", error);
    res.status(500).json({ message: "Server error" });
  }
};
