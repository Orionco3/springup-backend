const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: { type: String },
  passwordText: { type: String },

  teamName: { type: String, default: "" },
  teamNo: { type: String, default: "" },
  lastCount: { type: Number, default: "" },
  bulkUser: { type: Boolean, default: false },
  testUser: { type: Boolean, default: false },

  type: { type: String, default: "" },
  route: { type: String, default: "" },

  avatar: { type: String, default: "" },
  isAvatarUpdated: { type: Boolean, default: false },

  userName: { type: String, default: "" },
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  gender: { type: String, default: "Male" },
  country: { type: String, default: "" },
  states: { type: String, default: "" },
  phoneNumber: { type: String, default: "" },

  description: { type: String, default: "" },
  profileVisited: { type: Number, default: 0 },
  count: { type: Number, default: 0 },
  captainName: { type: String, default: "" },
  regForm: { type: Array, default: [] },

  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  iscompleted: { type: Boolean, default: false },
  role: { type: String, default: "" },
  raceId: { type: mongoose.Schema.Types.ObjectId, ref: "race" },
  raceRouteId: { type: mongoose.Schema.Types.ObjectId, ref: "raceRoute" },
  createdAt: { type: Date, requires: true, default: Date.now },
  updatedAt: { type: Date, requires: true, default: Date.now },
});

userSchema.methods.verifyPassword = function verifyPassword(password) {
  return bcrypt.compareSync(password, this.password ? this.password : "");
};

module.exports = mongoose.model("user", userSchema);
