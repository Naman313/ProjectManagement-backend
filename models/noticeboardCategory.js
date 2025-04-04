const mongoose = require("mongoose");
const defaultCategories = [
  "All messages",
  "Announcement",
  "FYI",
  "Heartbeat",
  "Pitch",
  "Question",
];

const NoticeboardCategorySchema = new mongoose.Schema({
  name: {
    type: [String],
    required: true,
    default: defaultCategories,
  },
});

const NoticeboardCategory = mongoose.model(
  "NoticeboardCategory",
  NoticeboardCategorySchema
);


module.exports = NoticeboardCategory;
