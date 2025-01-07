const mongoose = require("mongoose");

const contactSkin = new mongoose.Schema({
  title: { type: String, default: "" },
  stageId: { type: Array, default: [] },
  raceId: { type: mongoose.Schema.Types.ObjectId, ref: "race" },
  createdAt: { type: Date, requires: true, default: Date.now },
});

module.exports = mongoose.model("raceRoute", contactSkin);
