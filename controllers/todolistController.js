const TodoList = require("../models/todolist");
const Todo = require("../models/todo");
const Project = require("../models/project");
// const Comment = require("../models/todoComment");

exports.createTodoList = async (req, res) => {
  try {
    const { title, projectId } = req.body;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Create new TodoList
    const newTodoList = new TodoList({
      title,
      projectId,
      todos: [],
    });

    // Save TodoList to database
    const savedTodoList = await newTodoList.save();

    // Add TodoList ID to project's todoLists array
    project.todoLists.push(savedTodoList._id);
    await project.save();

    res.status(201).json(savedTodoList);
  } catch (error) {
    console.error("Error creating TodoList:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getTodoLists = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Fetch todo lists by projectId and populate the 'todos' field
    const todoLists = await TodoList.find({ projectId });

    if (!todoLists) {
      return res.status(404).json({ message: "No TodoLists found for this project." });
    }

    res.status(200).json(todoLists);
  } catch (error) {
    console.error("Error fetching TodoLists:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getTodoList = async (req, res) => {
  try {
    // console.log("getTodoList")
    const todoList = await TodoList.findById(req.params.todoListId);
    if (!todoList) {
      return res.status(404).json({ message: "TodoList not found" });
    }
    res.json(todoList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.editTodoList = async (req, res) => {
  try {
    const { todoListId } = req.params;
    const updates = req.body;

    // Find and update the TodoList
    const updatedTodoList = await TodoList.findByIdAndUpdate(todoListId, updates, { new: true });
    if (!updatedTodoList) {
      return res.status(404).json({ message: "TodoList not found" });
    }

    res.status(200).json({ message: "TodoList updated successfully", todoList: updatedTodoList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteTodoList = async (req, res) => {
  try {
    const { todoListId } = req.params;

    // Find and delete the TodoList
    const todoList = await TodoList.findByIdAndDelete(todoListId);
    if (!todoList) {
      return res.status(404).json({ message: "TodoList not found" });
    }

    // Delete all related todos
    await Todo.deleteMany({ todoListId });

    // Update Project to remove the deleted TodoList
    await Project.findByIdAndUpdate(todoList.projectId, { $pull: { todoLists: todoListId } });

    res.status(200).json({ message: "TodoList and associated todos deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

