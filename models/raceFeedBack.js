const mongoose = require("mongoose");

const raceFeedBack = new mongoose.Schema({
  feedBack: { type: Array, default: [] },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  raceId: { type: mongoose.Schema.Types.ObjectId, ref: "race" },
  createdAt: { type: Date, requires: true, default: Date.now },
});

module.exports = mongoose.model("raceFeedBack", raceFeedBack);
