const mongoose = require("mongoose");

const bestPlayerSchema = new mongoose.Schema(
  {
    playerName: {
      type: String,
      required: true,
      trim: true,
    },
    team: {
      type: String,
      required: true,
      trim: true,
    },
    points: {
      type: Number,
      required: true,
      min: 0,
    },
    rebounds: {
      type: Number,
      required: true,
      min: 0,
    },
    assists: {
      type: Number,
      required: true,
      min: 0,
    },
    gameDate: {
      type: String,
      required: true,
      trim: true,
    },
    playerImage: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BestPlayer", bestPlayerSchema);
