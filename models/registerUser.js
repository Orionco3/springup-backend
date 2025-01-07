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

  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },

  phoneNumber: { type: String, default: "" },

  origin: { type: String, default: "" },
  residence: { type: String, default: "" },
  institute: { type: String, default: "" },
  faculty: { type: String, default: "" },
  department: { type: String, default: "" },
  invitedBy: { type: String, default: "" },

  createdAt: { type: Date, requires: true, default: Date.now },
});

userSchema.methods.verifyPassword = function verifyPassword(password) {
  return bcrypt.compareSync(password, this.password ? this.password : "");
};

module.exports = mongoose.model("userRegister", userSchema);
