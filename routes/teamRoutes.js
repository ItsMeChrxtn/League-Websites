const express = require("express");
const {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
} = require("../controllers/teamController");

const router = express.Router();

router.route("/").get(getTeams).post(createTeam);
router.route("/:id").get(getTeamById).put(updateTeam).delete(deleteTeam);

module.exports = router;
