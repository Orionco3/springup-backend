const mongoose = require("mongoose");

const contactSkin = new mongoose.Schema({
  question: { type: String, default: "" },
  raceId: { type: mongoose.Schema.Types.ObjectId, ref: "race" },
  createdAt: { type: Date, requires: true, default: Date.now },
});

module.exports = mongoose.model("feedBackQuestion", contactSkin);
