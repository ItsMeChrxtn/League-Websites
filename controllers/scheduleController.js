const Schedule = require("../models/Schedule");

const getSchedule = async (req, res) => {
  try {
    const games = await Schedule.find().sort({ createdAt: -1 });
    return res.json(games);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getScheduleById = async (req, res) => {
  try {
    const game = await Schedule.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: "Schedule item not found" });
    }

    return res.json(game);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createSchedule = async (req, res) => {
  try {
    const game = await Schedule.create(req.body);
    return res.status(201).json(game);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const game = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!game) {
      return res.status(404).json({ message: "Schedule item not found" });
    }

    return res.json(game);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const game = await Schedule.findByIdAndDelete(req.params.id);

    if (!game) {
      return res.status(404).json({ message: "Schedule item not found" });
    }

    return res.json({ message: "Schedule item deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSchedule,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};
