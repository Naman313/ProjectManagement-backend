const express = require("express");
const {
  searchUsers,
  profile,
  getUsers,
  changeRole,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Search users route
router.get("/", authMiddleware, getUsers);
router.get("/search", authMiddleware, searchUsers);
router.get("/profile", authMiddleware, profile);
router.put("/change-role", roleMiddleware(["owner"]), authMiddleware, changeRole);


module.exports = router;
