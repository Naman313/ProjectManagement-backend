const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const todoRoutes = require("./routes/todos");
const scheduleRoutes = require("./routes/schedules");
const userRoutes = require("./routes/users");
const searchRoutes = require("./routes/search");
const noticeboardRoutes = require("./routes/noticeboard");
const todolistsRoutes= require("./routes/todolists")
const noticeboardCategoriesRoutes = require("./routes/noticeboardCategories");
// const sessionMiddleware = require("./middleware/session");
const uploadRoutes = require("./routes/uploadRoutes");

const connectDB = require("./config/database");

const app = express();
app.use(bodyParser.json());
// app.use(sessionMiddleware);

require("dotenv").config();

// Connect to MongoDB
connectDB();

app.use(
  cors({
    origin: "https://projectmanagement-frontend-ttta.vercel.app/",
    // "http://localhost:3000",
    credentials: true,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.use(express.static("uploads"));



app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/todolists", todolistsRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/noticeboard", noticeboardRoutes);
app.use("/api/categories", noticeboardCategoriesRoutes);
app.use("/api/files", uploadRoutes);


app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
