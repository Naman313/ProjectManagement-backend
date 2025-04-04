const express = require("express");

const {
    createTodoList,
    getTodoLists,
    getTodoList,
    deleteTodoList,
    editTodoList,
    } = require("../controllers/todolistController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, createTodoList);
router.get("/:projectId", authMiddleware, getTodoLists);
router.get("/list/:todoListId", authMiddleware, getTodoList);
router.put("/:todoListId", authMiddleware, editTodoList);
router.delete("/:todoListId", authMiddleware, deleteTodoList);

module.exports = router;