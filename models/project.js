const mongoose = require("mongoose");
const { assign } = require("nodemailer/lib/shared");

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true,
  },
  projectImage: {
    type: String,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    // required: true,
  },
  collaboration: {
    type: String,
    // required: true,
  },
  members: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        // type: String,
        ref: "User",
        // Reference to User collection
        // type: String,
      },
      name: {
        type: String,
      },
      role: {
        type: String,
        // enum: ['user', 'admin', 'owner'],  // Define allowed roles //
        default: "user", // Default role for new members //
      },
    },
  ],
  milestones: [
    {
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      createdOn: {
        type: Date,
        default: Date.now,
      },
      title: {
        type: String,
        // required: true,
      },
      assignedTo: [
        // type: String,
        {
        type:  mongoose.Schema.Types.ObjectId,
        ref: "User",
        },
    ],
      dueDate: {
        type: Date,
      },
      completedOn: {
        type: Date,
      },
      status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending",
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
    },
  ],
  todoLists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TodoList",
    },
  ],
  pinned: {
    type: Boolean,
    default: false,
  },
  archived: {
    type: Boolean,
    default: false,
  },
  trashed: {
    type: Boolean,
    default: false,
  },
  private: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Project = mongoose.model("Project", ProjectSchema);

module.exports = Project;
