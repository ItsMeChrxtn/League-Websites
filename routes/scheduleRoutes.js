const express = require("express");
const {
  getSchedule,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} = require("../controllers/scheduleController");

const router = express.Router();

router.route("/").get(getSchedule).post(createSchedule);
router.route("/:id").get(getScheduleById).put(updateSchedule).delete(deleteSchedule);

module.exports = router;
