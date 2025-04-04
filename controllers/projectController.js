const Project = require("../models/project");
const path = require("path");
const { bucket } = require("../config/gcsConfig");
const User = require("../models/user");

// Function to generate a unique filename
function generateUniqueFilename(originalName) {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000);
  const extension = path.extname(originalName);
  return `${timestamp}-${randomNum}${extension}`;
}

// exports.createProject = async (req, res) => {
//   try {
//     const { name, category, description, collaboration, members, milestones, pinned, archived, trashed } =
//       req.body;

//     let imageUrl = "";
//     if (req.file) {
//       const uniqueFilename = generateUniqueFilename(req.file.originalname);
//       const blob = bucket.file(uniqueFilename);
//       const blobStream = blob.createWriteStream({
//         resumable: false,
//       });

//       blobStream.on("error", (err) => {
//         return res.status(500).json({ message: err.message });
//       });

//       blobStream.on("finish", () => {
//         imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
//       });

//       blobStream.end(req.file.buffer);
//     }

//     const project = new Project({
//       name,
//       category,
//       description,
//       collaboration,
//       members,
//       milestones,
//       pinned,
//       archived,
//       trashed,
//       imageUrl,
//     });

//     await project.save();
//     res.status(201).json(project);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

exports.createProject = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      collaboration,
      members = [], // Use the members provided in the request body or an empty array
      milestones,
      pinned,
      archived,
      trashed,
      private: isPrivate,
    } = req.body;

    let projectImage = "";
    if (req.file) {
      const uniqueFilename = generateUniqueFilename(req.file.originalname);
      const blob = bucket.file(uniqueFilename);
      const blobStream = blob.createWriteStream({
        resumable: false,
      });

      blobStream.on("error", (err) => {
        return res.status(500).json({ message: err.message });
      });

      blobStream.on("finish", () => {
        projectImage = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      });

      blobStream.end(req.file.buffer);
    }

    // Add the current logged-in user to the members array
    const loggedInUser = req.user; // Assuming req.user contains the logged-in user's details
    // const currentUser = {
    //   id: loggedInUser._id, // User's ID
    //   name: loggedInUser.name, // User's name
    //   role: 'owner', // Assign the 'owner' role to the current user
    // };

    // // Ensure no duplicates in members and add the current user
    // const updatedMembers = [...members, currentUser].filter(
    //   (member, index, self) =>
    //     self.findIndex((m) => m.id === member.id) === index // Unique by id
    // );

    const project = new Project({
      name,
      category,
      description,
      collaboration,
      members, // Use the updated members array
      milestones,
      pinned,
      archived,
      trashed,
      private: isPrivate,
      projectImage,
      createdBy: loggedInUser._id, // Store the ID of the user who created the project
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "name",
      order = "asc",
      filterBy = "",
    } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const sortOrder = order === "desc" ? -1 : 1;

    let filter = {};
    const sort = { [sortBy]: sortOrder };

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (filterBy === "Pinned") {
      filter.pinned = true;
    } else if (filterBy === "Private") {
      filter.private = true;
    }

    // Dynamic filtering for roles within members
    if (filterBy === "With Clients" || filterBy === "Admin Projects") {
      const projects = await Project.find().populate("members");
      const filteredProjects = projects.filter(({ members }) =>
        members.some(
          ({ role }) =>
            (filterBy === "With Clients" && role === "client") ||
            (filterBy === "Admin Projects" && role === "admin")
        )
      );
      return res.json(filteredProjects);
    }

    // Fetch projects with pagination and dynamic filtering
    const projects = await Project.find(filter)
      .sort(sort)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    // console.log(req.params.projectId);
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getProjectsByUserId = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { "members.id": req.user.id }, // Check if user is a member
        { createdBy: req.user.id }, // Check if user is the creator
      ],
      trashed: false, // Exclude trashed projects
    });

    if (!projects) {
      return res
        .status(404)
        .json({ message: "No projects found for this user" });
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Update only the specified fields if they exist in the request body
    const { name, category, description, collaboration } = req.body;
    if (name !== undefined) project.name = name;
    if (category !== undefined) project.category = category;
    if (description !== undefined) project.description = description;
    if (collaboration !== undefined) project.collaboration = collaboration;

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.togglePin = async (req, res) => {
  const id = req.query.projectId;
  const pinned = req.body.pinned;
  try {
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // if (project.trashed) {
    //   return res.status(400).json({ message: "Cannot pin a trashed project" });
    // }

    project.pinned = pinned; // Toggle the pin state
    await project.save();

    res.json({
      message: `Project ${project.pinned ? "pinned" : "unpinned"} successfully`,
      project,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.toggleArchive = async (req, res) => {
  const id = req.query.projectId;
  const archived = req.body.archived;
  try {
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // if (project.trashed) {
    //   return res.status(400).json({ message: "Cannot archive a trashed project" });
    // }

    project.archived = archived; // Toggle the archive state
    await project.save();

    res.json({
      message: `Project ${
        project.archived ? "archived" : "unarchived"
      } successfully`,
      project,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.toggleTrash = async (req, res) => {
  const id = req.query.projectId;
  const trashed = req.body.trashed;
  try {
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.trashed = trashed; // Toggle the trash state

    if (project.trashed) {
      // If trashing the project, set pinned and archived to false
      project.pinned = false;
      project.archived = false;
    }

    await project.save();

    res.json({
      message: `Project ${
        project.trashed ? "trashed" : "restored"
      } successfully`,
      project,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getPinnedProjects = async (req, res) => {
  try {
    const pinnedProjects = await Project.find({
      $or: [
        { "members.id": req.user.id }, // Check if user is a member
        { createdBy: req.user.id } // Check if user is the creator
      ],
      pinned: true,
      trashed: false,
    });
    res.json({
      message: "Pinned projects fetched successfully",
      projects: pinnedProjects,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getArchivedProjects = async (req, res) => {
  try {
    const pinnedProjects = await Project.find({
      $or: [
        { "members.id": req.user.id }, // Check if user is a member
        { createdBy: req.user.id } // Check if user is the creator
      ],
      archived: true,
      trashed: false,
    });
    res.json({
      message: "Pinned projects fetched successfully",
      projects: pinnedProjects,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getPrivateProjects = async (req, res) => {
  try {
    const privateProjects = await Project.find({
      $or: [
        { "members.id": req.user.id }, // Check if user is a member
        { createdBy: req.user.id } // Check if user is the creator
      ],
      private: true,
      trashed: false,
    });
    res.json({
      message: "Private projects fetched successfully",
      projects: privateProjects,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getTrashedProjects = async (req, res) => {
  try {
    const trashedProjects = await Project.find({
      $or: [
        { "members.id": req.user.id }, // Check if user is a member
        { createdBy: req.user.id }, // Check if user is the creator
      ],
      trashed: true,
    });
    res.json({
      message: "Trashed projects fetched successfully",
      projects: trashedProjects,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.addMemberToProject = async (req, res) => {
  const member = req.body;

  try {
    const { name, projectId, userId, role } = member;


    const normalizedRole = role?.trim().toLowerCase();
    if (!["owner", "admin", "user"].includes(normalizedRole)) {
      return res.status(400).json({ 
        message: `Invalid role: ${role}` 
      });
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

      // Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if the user is already a member
      const existingMember = project.members.find(
        (member) => member.userId == userId  // naman need correction here
      );

      if (existingMember) {
        // Update the role if the user is already a member
        existingMember.role = role;
      } else {
        // Add the user to the project if they are not already a member
        project.members.push({ userId, role });
      }

      await project.save();
      res.status(200).json({ message: "Members added/updated successfully in the project" });
    }
  catch (error) {
    console.error("Error managing project member:", error);
    return res.status(500).json({ 
      message: error.message,
      success: false 
    });
  }
};

exports.updateMemberRole = async (req, res) => {
  try {
    const {name,  projectId, memberId, newRole } = req.body;

    // Validate request data
    if ( !projectId || !memberId || !newRole) {
      return res.status(400).json({ message: "Project ID, Member ID, and New Role are required." });
    }

    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    const existingMember = project.members.find((m) => m.id == memberId);

    if (existingMember) {
   
      existingMember.role = newRole;
      await project.save();
      return res.status(200).json({ message: "Member role updated successfully.", updatedMember: existingMember });
    } else {
      project.members.push({ id: memberId,name: name, role: newRole });
      await project.save();
      return res.status(201).json({ message: "New member added successfully.", newMember: { userId: memberId, role: newRole } });
    }
  } catch (error) {
    console.error("Error updating/adding member role:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};


// exports.addMemberToProject = async (req, res) => {
//   const members = req.body;

//   if (!Array.isArray(members)) {
//     return res.status(400).json({ message: "Invalid payload format. Expected an array of members." });
//   }

//   try {
//     for (const member of members) {
//       const { projectId, userId, role } = member;

//       // Debugging logs
//       console.log("Processing member:", member);

//       if (!projectId || !userId || !role) {
//         return res.status(400).json({ message: "Missing projectId, userId, or role." });
//       }

//       if (!["owner", "admin", "user"].includes(role?.trim().toLowerCase())) {
//         return res.status(400).json({ message: `Invalid role for user ${userId}: ${role}` });
//       }

//       const project = await Project.findById(projectId);
//       if (!project) {
//         return res.status(404).json({ message: "Project not found" });
//       }

//       const user = await User.findById(userId);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }

//       const isMember = project.members?.some(
//         (member) => member?.userId?.toString() === userId
//       );

//       if (isMember) {
//         return res.status(400).json({ message: `User ${userId} is already a member of the project` });
//       }

//       project.members.push({ userId, role });
//       await project.save();
//     }

//     res.status(200).json({ message: "Members added successfully to the project" });
//   } catch (error) {
//     console.error("Error adding members:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

exports.addMilestoneToProject = async (req, res) => {
  const { projectId, title, assignedTo, dueDate, status } = req.body;

  try {
    // Find the project by ID
    const project = await Project.findById(projectId);
    const userId = req.user.id;
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Create a new milestone object
    const milestone = {
      title,
      assignedTo,
      dueDate,
      status,
      createdBy: userId,
      createdOn: new Date()
    };

    // Add milestone to the project's milestones array
    project.milestones.push(milestone);
    await project.save();

    res
      .status(200)
      .json({ message: "Milestone added successfully", milestone });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.addMilestoneComment = async (req, res) => {
    try {
        const { mileStoneId } = req.params;
        const { comment } = req.body;
        const userId = req.user.id; 

        if (!comment) {
            return res.status(400).json({ message: "Comment cannot be empty" });
        }
        const project = await Project.findOne({ "milestones._id": mileStoneId });

        if (!project) {
            return res.status(404).json({ message: "Milestone not found" });
        }

        const milestone = project.milestones.find(m => m._id.toString() === mileStoneId);

        if (!milestone) {
            return res.status(404).json({ message: "Milestone not found" });
        }
        const newComment = {
            comment,
            commentedBy: userId,
            commentedOn: new Date(),
        };

        milestone.comments.push(newComment);

        // Save the updated project
        await project.save();

        res.status(201).json({ message: "Comment added successfully", comment: newComment });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.deleteMilestoneComment = async (req, res) => {
  try {
    const { projectId, milestoneId, commentId } = req.params;

    // const userId = req.user.id; 
    // Assuming authentication middleware sets `req.user`

    // Find the project with the given ID
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Find the milestone within the project
    const milestone = project.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    // Find the comment within the milestone
    const commentIndex = milestone.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user is the owner of the comment
    // if (milestone.comments[commentIndex].commentedBy.toString() !== userId) {
    //   return res.status(403).json({ message: "Unauthorized to delete this comment" });
    // }

    // Remove the comment
    milestone.comments.splice(commentIndex, 1);

    // Save the updated project
    await project.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.editMilestone = async (req, res) => {
  try {
    const { projectId, milestoneId } = req.params;
    const { title, assignedTo, dueDate } = req.body;

    // Find the project by projectId
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // Find the milestone within the project's milestones array
    const milestone = project.milestones.find(
      (milestone) => milestone._id== milestoneId
    );

    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found in this project." });
    }

    // Update the milestone fields if provided
    if (title) milestone.title = title;
    if (assignedTo) milestone.assignedTo = assignedTo;
    if (dueDate) milestone.dueDate = dueDate;
    // if (completedOn) milestone.completedOn = completedOn;
    // if (status) milestone.status = status;

    // Save the updated project
    await project.save();

    res.status(200).json({
      message: "Milestone updated successfully.",
      milestone,
      project,
    });
  } catch (error) {
    console.error("Error updating milestone:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
exports.getAdminProjects = async (req, res) => {
  try {
    // Extract user ID from request (assumed from token middleware)
    const userId = req.user.id;
    7;
    // Query projects where the user is an admin
    const adminProjects = await Project.find({
      members: { $elemMatch: { id: userId, role: "admin" } },
    });

    res.status(200).json({
      success: true,
      projects: adminProjects,
    });
  } catch (error) {
    console.error("Error fetching admin projects:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// exports.getUpcomingMilestones = async (req, res) => {
//   try {
//     const today = new Date();

//     const milestones = await Project.aggregate([
//       { $unwind: "$milestones" }, // Break milestones array into individual documents
//       {
//         $match: {
//           "milestones.dueDate": { $gte: today }, // Filter milestones with upcoming dates
//           "milestones.status": "pending",       // Only pending milestones
//         },
//       },
//       {
//         $sort: { "milestones.dueDate": 1 }, // Sort by closest dueDate
//       },
//       {
//         $project: {
//           projectName: "$name",              // Project name
//           milestone: "$milestones.title",   // Milestone title
//           dueDate: "$milestones.dueDate",   // Milestone dueDate
//           assignedTo: "$milestones.assignedTo", // Assigned user ID
//         },
//       },
//     ]);

//     res.status(200).json(milestones);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch milestones" });
//   }
// };

exports.getUpcomingMilestones = async (req, res) => {
  try {
    const loggedInUserId = req.user.id; // ID of the logged-in user (from middleware)

    // Define the "soon" date range, e.g., within the next 7 days
    const now = new Date();
    const soon = new Date();
    soon.setDate(now.getDate() + 7); // Customize the range as needed

    // Fetch projects where the logged-in user is a member
    const projects = await Project.find({
      $or: [
        { "members.id": loggedInUserId }, // Check if user is a member
        { createdBy: loggedInUserId }, // Check if user is the creator
      ], // Check membership using subdocument path
    })
      .select("milestones name")
      .populate({
        path: "milestones.assignedTo", // Populate the assignedTo field
        select: "fullName", // Select only the name field
      });

    // Filter milestones due within the next 7 days
    const upcomingMilestones = projects.flatMap((project) =>
      project.milestones
        .filter(
          (milestone) =>
            milestone.dueDate && // Ensure the milestone has a due date
            milestone.dueDate >= now && // Starting today
            milestone.dueDate <= soon // Ending in 7 days
        )
        .map((milestone) => ({
          ...milestone.toObject(),
          assignedTo: milestone.assignedTo
            ? milestone.assignedTo.fullName
            : null,
          projectName: project.name, // Include project name for context
          projectId: project._id, // Include project ID for reference
        }))
    );
    // console.log(upcomingMilestones);

    res.status(200).json(upcomingMilestones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};


exports.getMileStoneById = async (req, res) => {
    try {
        const { mileStoneId } = req.params;

        // Find the project that contains the milestone
        const project = await Project.findOne(
            { "milestones._id": mileStoneId },
        ).populate("milestones.comments.commentedBy", "fullName role")
        .populate("milestones.createdBy", "fullName"); 

        if (!project) {
            return res.status(404).json({ message: "Milestone not found" });
        }

        const milestone = project.milestones[0];

        res.status(200).json({ milestone, createdBy: project.createdBy});
    } catch (error) {
        console.error("Error fetching milestone:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.updateMilestoneStatus = async (req, res) => {
  const { projectId, milestoneId } = req.query;
  // console.log(projectId, milestoneId);
  const { status } = req.body; 

  let completedOn= "";
  if(status=== "completed"){
    completedOn= new Date()
  }
  // console.log(completedOn)
  try {
    // Validate status
    if (!["pending", "completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    // Update the milestone's status
    const updatedProject = await Project.findOneAndUpdate(
      {
        _id: projectId,
        "milestones._id": milestoneId,
      }, // Match project and milestone
      {
        $set: { "milestones.$.status": status,
          "milestones.$.completedOn": completedOn},

      }, // Update only the status of the specific milestone
      { new: true } // Return the updated document
    );

    if (!updatedProject) {
      return res.status(404).json({ error: "Project or Milestone not found." });
    }

    res.json({
      message: "Milestone status updated successfully.",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error updating milestone status:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// exports.getMilestoneByProjectId = async (req, res) => {
//   try {
//     const project = await Project.findById(req.params.projectId);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
//     res.status(200).json(project.milestones);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

exports.getProjectMembers = async (req, res) => {
  try {
      const { projectId } = req.params;
      //  console.log(projectId)
      // Find project by ID and return only the members field
      const project = await Project.findById(projectId).select("members");

      if (!project) {
          return res.status(404).json({ message: "Project not found" });
      }
      // console.log(project.members)
      res.status(200).json({ members: project.members });
  } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getProjectMilestones = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const project = await Project.findById(projectId).select("milestones").populate("milestones.assignedTo", "fullName");
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json({ milestones: project.milestones });
  } catch (error) {
    console.error("Error fetching milestones:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.removeMemberFromProject = async (req, res) => {
    try {
        const { projectId, memberId } = req.params;

        // Find the project by ID
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Check if the member exists in the project
        const memberIndex = project.members.findIndex(member => member.id.toString() === memberId);
        if (memberIndex === -1) {
            return res.status(404).json({ message: "Member not found in the project" });
        }

        // Remove the member from the array
        project.members.splice(memberIndex, 1);

        // Save the updated project
        await project.save();

        res.status(200).json({ message: "Member removed successfully", project });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteMilestone = async (req, res) => {
  try {
    
    const { projectId, milestoneId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    const milestoneIndex = project.milestones.findIndex(

      (milestone) => milestone._id == milestoneId
    );

    if (milestoneIndex === -1) {
      return res.status(404).json({ message: `Milestone not found in this project. ${milestoneId}` });
    }
    project.milestones.splice(milestoneIndex, 1);
    await project.save();

    res.status(200).json({
      message: "Milestone deleted successfully.",
      project: project,
    });
  } catch (error) {
    console.error("Error deleting milestone:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};



exports.editMilestoneComment = async (req, res) => {
  try {
    const { projectId, milestoneId, commentId } = req.params;
    const { newComment } = req.body;
    const userId = req.user.id; // Assuming authentication middleware sets `req.user'
    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Find the milestone
    const milestone = project.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    // Find the comment
    const comment = milestone.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user is the comment owner
    if (comment.commentedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to edit this comment" });
    }

    // Update the comment text
    comment.comment = newComment;
    comment.commentedOn = Date.now(); // Update the timestamp

    // Save the updated project
    await project.save();

    res.status(200).json({ message: "Comment updated successfully", updatedComment: comment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


