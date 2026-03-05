const express = require("express");
const {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
} = require("../controllers/teamController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(getTeams).post(protectAdmin, createTeam);
router.route("/:id").get(getTeamById).put(protectAdmin, updateTeam).delete(protectAdmin, deleteTeam);

module.exports = router;
