const User = require("../models/user");
const Project = require("../models/project");

exports.globalSearch = async (req, res) => {
  const { query } = req.query;

  try {
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Create a regex for case-insensitive search
    const searchRegex = new RegExp(query, "i");

    // Perform parallel searches across User and Project collections
    const [users, projects] = await Promise.all([
      User.find({
        $or: [
          { fullName: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
          { organization: { $regex: searchRegex } },
        ],
      }).select("-password -googleId"), // Exclude sensitive fields

      Project.find({
        $or: [
          { name: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { category: { $regex: searchRegex } },
          { collaboration: { $regex: searchRegex } },
        ],
      }),
    ]);

    const results = {
      users,
      projects,
    };

    res.status(200).json({ query, results });
  } catch (error) {
    console.error("Error in globalSearch:", error);
    res.status(500).json({ message: "Server error" });
  }
};
