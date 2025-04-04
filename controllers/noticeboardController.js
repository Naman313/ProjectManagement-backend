const Noticeboard = require("../models/noticeboard");
// const NoticeboardCategory = require("../models/noticeboardCategory");
// const NoticeboardComment = require("../models/noticeboardComment");

exports.createNoticeboard = async (req, res) => {
  try {
    const { title, description, category, notifyWhenPosted, postedBy, comments, project } = req.body;

    // Create a new Noticeboard entry
    const newNoticeboard = new Noticeboard({
      title,
      description,
      category,
      notifyWhenPosted,
      postedBy: req.user._id,
      comments,
      project,
    });

    // Save the Noticeboard to the database
    await newNoticeboard.save();

    // Respond with the created noticeboard
    res.status(201).json({
      message: "Noticeboard created successfully!",
      noticeboard: newNoticeboard,
    });
  } catch (error) {
    console.error("Error creating noticeboard:", error);
    // res.status(500).json({ message: "Server error, please try again later." });
    res.status(500).json({ message: error.message });
  }
};

// exports.getNoticeboards = async (req, res) => {
//   try {
//     const { sortBy, category, page = 1, limit = 10, search } = req.query;

//     // Build the query object
//     const query = {};

//     // Convert the category name to an ObjectId if category is provided
//     if (category) {
//       const categoryDoc = await NoticeboardCategory.findOne({ name: category });
//       if (categoryDoc) {
//         query.category = categoryDoc._id;
//       } else {
//         return res.status(400).json({ message: "Invalid category" });
//       }
//     }

//     Apply search filter if provided
//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: "i" } },
//         { description: { $regex: search, $options: "i" } },
//       ];
//     }

//     // Configure the query
//     let noticeboardQuery = Noticeboard.find(query)
//       .populate("category") // Populate category details if needed
//       .populate("postedBy") // Populate postedBy details if needed
//       .populate("comments"); // Populate comments details if needed

//     // Apply sorting
//     const sortOptions = {
//       postDate: { postedOn: -1 }, // Sort by post date (newest first)
//       latestComment: { "comments.date": -1 }, // Sort by latest comment date (newest first)
//       alphabetical: { title: 1 }, // Sort alphabetically by title (A-Z)
//     };

//     if (sortBy && sortOptions[sortBy]) {
//       noticeboardQuery = noticeboardQuery.sort(sortOptions[sortBy]);
//     }

//     // Apply pagination
//     const skip = (page - 1) * parseInt(limit);
//     noticeboardQuery = noticeboardQuery.skip(skip).limit(parseInt(limit));

//     // Execute the query
//     const noticeboards = await noticeboardQuery.exec();
//     res.json(noticeboards);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
exports.getLatestNoticeboards = async (req, res) => {
  try {
    const { projectId } = req.query; // Get projectId from request parameters

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    const noticeboards = await Noticeboard.find({ project: projectId }) // Filter by project ID
      // .sort({ postedOn: -1 })
      .populate("postedBy", "fullName"); // Populate category with name field
    // console.log(noticeboards)
    res.json(noticeboards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getNoticeboard = async (req, res) => {
  try {
    const noticeboard = await Noticeboard.findById(req.params.noticeboardId).populate("postedBy", "fullName")
    .populate("comments.commentedBy", "fullName role")
    .populate("notifyWhenPosted", "fullName role");
    if (!noticeboard) {
      return res.status(404).json({ message: "Noticeboard not found" });
    }
    res.json(noticeboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateNoticeboard = async (req, res) => {
  try {
    const noticeboard = await Noticeboard.findByIdAndUpdate(
      req.params.noticeboardId,
      req.body,
      { new: true }
    );
    if (!noticeboard) {
      return res.status(404).json({ message: "Noticeboard not found" });
    }
    res.json(noticeboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addNoticeboardComment = async (req, res) => {
  try {
    // const { noticeboardId } = req.params; // Get noticeboard ID from request params
    const { noticeboardId } = req.params; // Get noticeboard ID from request params
    const { comment } = req.body; // Get comment from request body
    const userId = req.user.id; // Assuming `req.user` has the authenticated user's ID
    // console.log(req.user);

    if (!comment) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    // Find the noticeboard post
    const noticeboard = await Noticeboard.findById(noticeboardId);

    if (!noticeboard) {
      return res.status(404).json({ message: "Noticeboard not found" });
    }

    // Add the new comment
    const newComment = {
      comment,
      commentedBy: userId,
    };

    noticeboard.comments.push(newComment);
    // Save the updated noticeboard
    await noticeboard.save();

    res.status(201).json({ message: "Comment added successfully", newComment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// exports.deleteNoticeboard = async (req, res) => {
//   const { noticeboardId } = req.params;

//   try {
//     const noticeboard = await Noticeboard.findById(noticeboardId);

//     if (!noticeboard) {
//       return res.status(404).json({ message: "Noticeboard not found" });
//     }

//     const deleteComments = noticeboard.comments
//       ? NoticeboardComment.deleteMany({ _id: { $in: noticeboard.comments } })
//       : Promise.resolve();

//     await Promise.all([deleteComments, Noticeboard.findByIdAndDelete(noticeboardId)]);

//     res.json({ message: "Noticeboard deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
