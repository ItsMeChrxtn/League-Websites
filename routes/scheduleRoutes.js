const express = require("express");
const {
  getSchedule,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} = require("../controllers/scheduleController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(getSchedule).post(protectAdmin, createSchedule);
router.route("/:id").get(getScheduleById).put(protectAdmin, updateSchedule).delete(protectAdmin, deleteSchedule);

module.exports = router;
