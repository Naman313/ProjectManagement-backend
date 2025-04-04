const Todo = require("../models/todo");
const TodoList = require("../models/todolist");
const User= require("../models/user")
const mongoose = require("mongoose");
// exports.getTodos = async (req, res) => {
//   try {
//     const todos = await Todo.find().populate("projectId", "name");;
//     res.json(todos);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

exports.createTodo = async (req, res) => {
  try {
    const {
      todoListId,
      task,
      projectId,
      dueDate,
      assignedTo,
      notifyUsers,
      notes,
      attachments,
    } = req.body.formData;

    // Validate required fields
    if (!todoListId || !task || !projectId || !req.user.id) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    const correctedNotifyUsers = notifyUsers.map(user => user.id || user._id);
    // Create a new Todo
    
    const newTodo = new Todo({
      todoListId,
      task,
      projectId,
      dueDate,
      assignedTo,
      notifyUsers: correctedNotifyUsers,
      notes,
      attachments,
      createdBy: req.user.id,
    });
    // console.log(dueDate)
    await newTodo.save();

    // Find the TodoList and update it by adding the new todo's ID
    const todoList = await TodoList.findById(todoListId);
    if (!todoList) {
      return res.status(404).json({ message: "Todo List not found" });
    }

    todoList.todos.push(newTodo._id); // Add the new todo's ID to the list
    await todoList.save(); // Save the updated TodoList

    res.status(201).json({
      message: "Todo created successfully and added to Todo List.",
      todo: newTodo,
    });
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

exports.getTodos = async (req, res) => {
  try {

    const userId = req.user.id;

    // Fetch todos where the logged-in user is in the assignedTo field
    const todos = await Todo.find({ assignedTo: { $in: [userId] } })
      .populate("projectId", "name") // Populate project details
      .populate("assignedTo", "name email") // Populate assigned users' details
      .populate("notifyUsers", "name email"); // Populate notify users' details
    // console.log("These are your Todos", todos)
    res.status(200).json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ message: "Failed to fetch todos" });
  }
};


exports.editTodo = async (req, res) => {
  try {
    const { todoId } = req.params;
    let {
      todoListId,
      task,
      projectId,
      dueDate,
      assignedTo,
      notifyUsers,
      notes,
      attachments,
    } = req.body;

    // Validate todoListId before updating
    if (todoListId && !mongoose.Types.ObjectId.isValid(todoListId)) {
      return res.status(400).json({ message: "Invalid todoListId format" });
    }

    const updateData = {
      task,
      projectId,
      dueDate,
      assignedTo,
      notifyUsers,
      notes,
      attachments,
      updatedAt: Date.now(),
    };

    if (todoListId) updateData.todoListId = todoListId;
    const updatedTodo = await Todo.findByIdAndUpdate(todoId, updateData, { new: true });
      // console.log(updateData)
    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }


    res.status(200).json({ message: "Todo updated successfully", todo: updatedTodo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.getTodosByTodoList = async (req, res) => {
  try {
    const { todoListId } = req.params;

    if (!todoListId) {
      return res.status(400).json({ message: "TodoList ID is required" });
    }

    const todos = await Todo.find({ todoListId }).populate("createdBy", "fullName");
    // console.log(todos)
    res.status(200).json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.todoId).populate("assignedTo", "fullName")
      .populate("notifyUsers", "fullName")
      .populate("createdBy", "fullName")
      .populate("comments.commentedBy", "fullName role")
   
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    
    res.json(todo);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addTodoComment = async (req, res) => {
  try {
    const { todoId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    if (!comment) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    // 🔹 FIXED: Correct way to find Todo by ID
    const todo = await Todo.findById(todoId);
    
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    const newComment = {
      comment,
      commentedBy: userId,
      commentedOn: new Date(),
    };

    todo.comments.push(newComment);
    await todo.save();

    res.status(201).json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    console.error("Error adding comment in Todos:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.editTodoComment= async(req, res)=>{
  try{
    const {todoId, commentId}= req.params;
    const userId= req.user.id;
    const { newComment } = req.body;
    const todo= await Todo.findById(todoId);
    if(!todo){
      return res.status(404).json({message:"Todo not found"});
    }
    const comment = todo.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.commentedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to edit this comment" });
    }

    comment.comment = newComment;
    comment.commentedOn = Date.now();
    await todo.save();
    return res.status(200).json({message: "Todo Comment edited successfully"})
  }catch(error){
    return res.status(500).json({message: "Error in editing Todo"})
  }
}
exports.deleteTodoComment = async (req, res) => {
  try {
    const { todoId, commentId } = req.params;
    // Find the todo item
    const todo = await Todo.findById(todoId);
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    const commentIndex = todo.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );
    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    todo.comments.splice(commentIndex, 1);
    await todo.save();
    res.status(200).json({message: "Comment deleted successfully"});
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.deleteTodo = async (req, res) => {
  try {
    const { todoId } = req.params;

    const deletedTodo = await Todo.findByIdAndDelete({_id: todoId});
    
    if (!deletedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    
    // Update TodoList to remove the deleted todo
    await TodoList.findByIdAndUpdate(deletedTodo.todoListId, { $pull: { todos: todoId } });

    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.toggleTodoStatus = async (req, res) => {
  // console.log(req.body)
  const todoId =req.params.todoId
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      {_id:todoId},
      { status: req.body.status }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: "To-Do not found" });
    }

    res.status(200).json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
};


