const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const teamRoutes = require("./routes/teamRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const bestPlayerRoutes = require("./routes/bestPlayerRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Basketball League API is running",
  });
});

app.use("/api/teams", teamRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/players", bestPlayerRoutes);
app.use("/api/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
