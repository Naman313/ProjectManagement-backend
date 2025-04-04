const express = require("express");

const {
  createTodo,
  getTodos,
  getTodo,
  deleteTodo,
  toggleTodoStatus,
  getTodosByTodoList,
  addTodoComment,
  deleteTodoComment,
  editTodoComment,
  editTodo,
} = require("../controllers/todoController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, createTodo);
router.get("/list/:todoListId", authMiddleware, getTodosByTodoList);
router.get("/", authMiddleware, getTodos);
router.get("/:todoId", authMiddleware, getTodo);
router.patch("/editTodo/:todoId",  authMiddleware,editTodo)
router.patch("/toogleTodo/:todoId", authMiddleware, toggleTodoStatus);
router.delete("/:todoId", authMiddleware, deleteTodo);
router.post("/:todoId/comment", authMiddleware, addTodoComment);
router.delete("/:todoId/:commentId",deleteTodoComment)
router.patch("/:todoId/:commentId",authMiddleware, editTodoComment);


module.exports = router;
