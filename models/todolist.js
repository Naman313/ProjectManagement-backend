const mongoose = require("mongoose");

const TodoListSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  todos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Todo",
    },
  ],
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
});

const TodoList = mongoose.model("TodoList", TodoListSchema);

module.exports = TodoList;