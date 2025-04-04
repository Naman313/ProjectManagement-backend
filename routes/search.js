const express = require("express");
const { globalSearch } = require("../controllers/searchController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Global search route
router.get("/", authMiddleware, globalSearch);

module.exports = router;
