const Schedule = require("../models/schedule");
const Project = require("../models/project");
const User = require("../models/user");

// Create a new schedule
exports.createSchedule = async (req, res) => {
  try {
    const {
      title,
      message,
      projectId,
      scheduledDate,
      attachments,
      status,
      createdBy,
    } = req.body;

    // Validate projectId and createdBy to ensure they are valid
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const user = await User.findById(createdBy);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new schedule document
    const schedule = new Schedule({
      title,
      message,
      projectId,
      scheduledDate,
      attachments,
      status,
      createdBy,
    });

    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all schedules
exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate("projectId")
      .populate("createdBy");
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get schedule by project ID
exports.getScheduleByProject = async (req, res) => {
  try {
    const schedule = await Schedule.find({ projectId: req.params.projectId })
      .populate("projectId")
      .populate("createdBy");

    if (!schedule || schedule.length === 0) {
      return res
        .status(404)
        .json({ message: "Schedule not found for this project" });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Get schedules by user ID
exports.getScheduleByUserId = async (req, res) => {
  try {
    const schedule = await Schedule.find({ createdBy: req.params.userId })
      .populate("projectId")
      .populate("createdBy");

    if (!schedule || schedule.length === 0) {
      return res
        .status(404)
        .json({ message: "Schedule not found for this user" });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all schedules by status (Pending/Completed)
exports.getSchedulesByStatus = async (req, res) => {
  try {
    const schedules = await Schedule.find({ status: req.params.status })
      .populate("projectId")
      .populate("createdBy");

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get upcoming schedules (based on scheduledDate)
exports.getUpcomingSchedules = async (req, res) => {
  try {
    const today = new Date();
    const upcomingSchedules = await Schedule.find({
      scheduledDate: { $gt: today },
    })
      .populate("projectId")
      .populate("createdBy")
      .sort({ scheduledDate: "asc" });
    res.json(upcomingSchedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Restore a trashed schedule (if applicable)
// exports.restoreSchedule = async (req, res) => {
//   try {
//     const schedule = await Schedule.findByIdAndUpdate(
//       req.params.scheduleId,
//       { trashed: false },
//       { new: true }
//     );
//     if (!schedule) {
//       return res.status(404).json({ message: "Schedule not found" });
//     }
//     res.json(schedule);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
