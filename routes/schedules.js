const express = require("express");
const {
  createSchedule,
  getSchedules,
  getScheduleByProject,
} = require("../controllers/scheduleController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");  // For handling file uploads (attachments)
const router = express.Router();

// Create a new schedule (with optional attachments)
router.post("/", authMiddleware, upload.array("attachments"), createSchedule);

// Get a list of all schedules
router.get("/", authMiddleware, getSchedules);


// Get all schedules by projectId
router.get("/by-project/:projectId", authMiddleware, getScheduleByProject);



// router.put("/restore/:scheduleId", authMiddleware, restoreSchedule);

module.exports = router;
