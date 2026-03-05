const express = require("express");
const {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
} = require("../controllers/bestPlayerController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(getPlayers).post(protectAdmin, createPlayer);
router.route("/:id").get(getPlayerById).put(protectAdmin, updatePlayer).delete(protectAdmin, deletePlayer);

module.exports = router;
