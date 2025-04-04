const NoticeboardCategory = require("../models/noticeboardCategory");

exports.getNoticeboardCategories = async (req, res) => {
  try {
    let categories = await NoticeboardCategory.findOne(); // Fetch the categories

    // If no categories exist, create one with default values
    if (!categories) {
      categories = await NoticeboardCategory.create({ name: [
        "All messages",
        "Announcement",
        "FYI",
        "Heartbeat",
        "Pitch",
        "Question"
      ]});
    }

    res.status(200).json({ categories: categories.name });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// exports.getNoticeboardCategory = async (req, res) => {
//   try {
//     const noticeboardCategory = await NoticeboardCategory.findById(
//       req.params.noticeboardCategoryId
//     );
//     if (!noticeboardCategory) {
//       return res.status(404).json({ message: "NoticeboardCategory not found" });
//     }
//     res.json(noticeboardCategory);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

exports.addCustomCategory = async (req, res) => {
  try {
    const { category } = req.body;
    if (!category) {
      return res.status(400).json({ message: "Category name is required." });
    }

    let categories = await NoticeboardCategory.findOne();
    if (!categories) {
      categories = await NoticeboardCategory.create({ name: [] });
    }

    if (categories.name.includes(category)) {
      return res.status(400).json({ message: "Category already exists." });
    }

    categories.name.push(category);
    await categories.save();

    res.status(201).json({ message: "Category added successfully.", categories: categories.name });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};