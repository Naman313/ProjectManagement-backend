const express = require("express");

const {
  createNoticeboard,
  // getNoticeboards,
  getLatestNoticeboards,
  getNoticeboard,
  updateNoticeboard,
  addNoticeboardComment,
//   deleteNoticeboard,
} = require("../controllers/noticeboardController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, createNoticeboard);
// router.get("/", authMiddleware, getNoticeboards);
router.get("/latest", authMiddleware, getLatestNoticeboards);
router.get("/:noticeboardId", authMiddleware, getNoticeboard);
router.put("/:noticeboardId", authMiddleware, updateNoticeboard);
router.post("/:noticeboardId/comment", authMiddleware, addNoticeboardComment);

// router.delete("/:noticeboardId", authMiddleware, deleteNoticeboard);

module.exports = router;
