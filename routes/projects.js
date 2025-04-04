const express = require("express");

const {
  createProject,
  getProject,
  getProjects,
  updateProject,
  deleteProject,
  getProjectsByUserId,
  togglePin,
  toggleArchive,
  toggleTrash,
  getPinnedProjects,
  getArchivedProjects,
  getTrashedProjects,
  addMemberToProject,
  removeMemberFromProject,
  addMilestoneToProject,
  deleteMilestone,
  editMilestone,
  getAdminProjects,
  getUpcomingMilestones,
  getPrivateProjects,
  updateMilestoneStatus,
  getProjectMembers,
  getProjectMilestones,
  updateMemberRole,
  getMileStoneById,
  addMilestoneComment,
  deleteMilestoneComment, 
  editMilestoneComment
} = require("../controllers/projectController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const router = express.Router();

// router.post("/", authMiddleware, roleMiddleware(["admin", "owner"]) ,upload.single("image"), createProject);
router.post("/create", authMiddleware,upload.single("image"), createProject);
router.get("/", authMiddleware, getProjects);
router.get("/my-projects", authMiddleware, getProjectsByUserId);// do not put user id in params like this "/:userId"
router.get("/project/:projectId", authMiddleware, getProject);
router.patch("/project/:projectId", authMiddleware, updateProject);
router.delete("/project/:projectId", authMiddleware, deleteProject);
router.put("/pinned", authMiddleware, togglePin);
router.put("/archived", authMiddleware, toggleArchive);
router.put("/trashed", authMiddleware, toggleTrash);
router.get("/pinned", authMiddleware, getPinnedProjects);
router.get("/archived", authMiddleware, getArchivedProjects);
router.get("/trashed", authMiddleware, getTrashedProjects);
router.get("/private", authMiddleware, getPrivateProjects);
router.get("/:projectId/members", authMiddleware, getProjectMembers);
// router.post("/project/add-member", roleMiddleware(["admin", "owner"]), authMiddleware, addMemberToProject);
router.post("/project/add-member", authMiddleware, addMemberToProject);
router.patch("/projects/members/change-role", authMiddleware, updateMemberRole);
// router.post("/project/remove-member", authMiddleware, removeMemberFromProject);
router.post("/project/add-milestone", authMiddleware, addMilestoneToProject);
router.patch("/:projectId/milestones/:milestoneId", authMiddleware, editMilestone);
router.get("/admin", authMiddleware, getAdminProjects);
router.get("/upcoming-milestones", authMiddleware, getUpcomingMilestones);

//get Milestone by Id
router.get("/:mileStoneId", authMiddleware, getMileStoneById);
router.post("/:mileStoneId/comment", authMiddleware, addMilestoneComment)
router.delete("/:projectId/:milestoneId/:commentId", deleteMilestoneComment);
//Toggle milestone Stautus
router.patch("/milestones/update-status", authMiddleware, updateMilestoneStatus);
router.get("/:projectId/milestones", authMiddleware, getProjectMilestones);
router.delete("/project/:projectId/members/:memberId", removeMemberFromProject);

// Delete and Edit mileStone Api
router.delete("/:projectId/milestones/:milestoneId", deleteMilestone);
router.patch("/:projectId/:milestoneId/:commentId", authMiddleware, editMilestoneComment)






module.exports = router;
