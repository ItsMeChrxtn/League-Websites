const BestPlayer = require("../models/BestPlayer");

const getPlayers = async (req, res) => {
  try {
    const players = await BestPlayer.find().sort({ createdAt: -1 });
    return res.json(players);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getPlayerById = async (req, res) => {
  try {
    const player = await BestPlayer.findById(req.params.id);

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    return res.json(player);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createPlayer = async (req, res) => {
  try {
    const player = await BestPlayer.create(req.body);
    return res.status(201).json(player);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updatePlayer = async (req, res) => {
  try {
    const player = await BestPlayer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    return res.json(player);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const deletePlayer = async (req, res) => {
  try {
    const player = await BestPlayer.findByIdAndDelete(req.params.id);

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    return res.json({ message: "Player deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
};
