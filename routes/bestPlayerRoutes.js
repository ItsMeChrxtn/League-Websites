const express = require("express");
const {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
} = require("../controllers/bestPlayerController");

const router = express.Router();

router.route("/").get(getPlayers).post(createPlayer);
router.route("/:id").get(getPlayerById).put(updatePlayer).delete(deletePlayer);

module.exports = router;
