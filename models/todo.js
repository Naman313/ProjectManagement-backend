const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
  todoListId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TodoList", 
    required: true,
  },
  task: {
    type: String,
    required: true, 
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  dueDate: {
    type: Date,
  },
  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  notifyUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Changed from `notifyWhenComplete` to array
    },
  ],
  notes: {
    type: String, // New field
  },
  attachments: [
    {
      fileName: {
        type: String,
      },
      fileUrl: {
        type: String,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  status: {
    type: String,
    enum: ["Pending", "Completed"], // New enum field
    default: "Pending",
  },

  createdAt: {
    type: Date,
    default: Date.now, // Changed field name
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true, // Updated to required
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
});

const Todo = mongoose.model("Todo", TodoSchema);

module.exports = Todo;
