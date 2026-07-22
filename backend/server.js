require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const taskRoutes = require("./routes/taskRoutes");
const routineRoutes = require("./routes/routineRoutes");
const noteRoutes = require("./routes/noteRoutes");
const homeRoutes = require("./routes/homeRoutes");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.json({ status: "CampusMind API is running" }));

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/routine", routineRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/home", homeRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`CampusMind API listening on port ${PORT}`));

module.exports = app;
