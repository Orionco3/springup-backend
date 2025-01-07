const mongoose = require("mongoose");

const contactHistory = new mongoose.Schema({
  isCompleted: { type: Boolean, default: false },
  scoreSecondWin: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 },
  timeSaved: { type: Number, default: 0 },
  penality:  { type: Number, default: 0 },
  isPenality: { type: Boolean, default: false },
  isCheating: { type: Boolean, default: false },
  stageId: { type: mongoose.Schema.Types.ObjectId, ref: "stage" },
  raceId: { type: mongoose.Schema.Types.ObjectId, ref: "race" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  raceRouteId: { type: mongoose.Schema.Types.ObjectId, ref: "raceRoute" },
  checkIn: { type: Date, default: "" },
  checkOut: { type: Date, default: "" },
  createdAt: { type: Date, requires: true, default: Date.now },
});

module.exports = mongoose.model("raceHistory", contactHistory);
