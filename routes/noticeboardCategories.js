const express = require("express");

const {
    addCustomCategory,
    getNoticeboardCategories,
    // getNoticeboardCategory,
    // updateNoticeboardCategory,
    // deleteNoticeboardCategory,
    } = require("../controllers/noticeboardCategoryController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", authMiddleware, getNoticeboardCategories);
router.post("/", authMiddleware, addCustomCategory);
// router.get("/:noticeboardCategoryId", authMiddleware, getNoticeboardCategory);
// router.put("/:noticeboardCategoryId", authMiddleware, updateNoticeboardCategory);
// router.delete("/:noticeboardCategoryId", authMiddleware, deleteNoticeboardCategory);

module.exports = router;