const mongoose = require("mongoose");

const contactSkin = new mongoose.Schema({
  title: { type: String, default: "" },
  createdAt: { type: Date, requires: true, default: Date.now },
});

module.exports = mongoose.model("group", contactSkin);
