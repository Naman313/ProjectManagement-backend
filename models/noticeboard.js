const mongoose = require("mongoose");
const { notify } = require("../routes/projects");
// const Project = require("./project");

const NoticeboardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    // ref: "NoticeboardCategory",
  },
  // notifyWhenPosted: {
  //   // type: mongoose.Schema.Types.ObjectId,
  //   type: String,
  //   // ref: "User",
  // },
  notifyWhenPosted: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  postedOn: {
    type: Date,
    default: Date.now,
  },
  comments: [
    {
      comment: {
        type: String,
      },
      commentedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      commentedOn: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  files: [
    {
      fileName: String,
      filePath: String,
    },
  ],
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
});

const Noticeboard = mongoose.model("Noticeboard", NoticeboardSchema);

module.exports = Noticeboard;
