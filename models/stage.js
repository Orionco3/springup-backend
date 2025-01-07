const mongoose = require("mongoose");

const contactSkin = new mongoose.Schema({
  name: { type: String, default: "" },
  googleMapLink: { type: Object, default: {} },

  locationInstruction: { type: Object, default: {} },
  locationMedia: { type: String, default: "" },
  locationType: { type: String, default: "None" },

  taskDescription: { type: Object, default: {} },
  taskMedia: { type: String, default: "" },
  taskMediaType: { type: String, default: "None" },

  checkInCode: { type: String, default: "" },
  checkOutCode: { type: String, default: "" },
  maxDuration: { type: String, default: "" },
  minDuration: { type: String, default: "" },
  address: { type: String, default: "" },

  taskMedia: { type: String, default: "" },
  locationMedia: { type: String, default: "" },

  endLocation: { type: Boolean, default: false },
  startLocation: { type: Boolean, default: false },

  raceId: { type: mongoose.Schema.Types.ObjectId, ref: "race" },

  copiedBy: { type: String, default: "" },

  createdAt: { type: Date, requires: true, default: Date.now },
});

module.exports = mongoose.model("stage", contactSkin);
