const User = require("../models/user");
const bcrypt = require("bcrypt");

const saltRounds = 10;

exports.updateUser = async (req, res) => {
  try {
    const payload = req.body;
    console.log(payload);
    const doc = await User.updateOne({ _id: req.user }, payload, {
      upsert: true,
    }).exec();
    if (!doc) {
      return res.status(404).send({
        success: false,
        message: "User Not Found!",
      });
    }
    const user = await User.findOne({ _id: req.user }).exec();
    return res.status(200).send({
      success: true,
      user,
      message: "User Profile Updated Successfully!",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSingleUser = async (req, res) => {
  try {
    const doc = await User.findOne({ _id: req.user }).exec();
    if (doc) {
      return res.status(200).json({ success: true, user: doc });
    } else {
      return res
        .status(200)
        .json({ success: true, message: "User does not exists!!" });
    }
  } catch (error) {
    return res.status(200).json({ status: 500, message: error });
  }
};


exports.getSingleData = async (req, res) => {
  try {

    const { id } = req.params;
  
    const doc = await User.findOne({ _id: id }).exec();
    if (doc) {
      return res.status(200).json({ success: true, user: doc });
    } else {
      return res
        .status(200)
        .json({ success: true, message: "User does not exists!!" });
    }
  } catch (error) {
    return res.status(200).json({ status: 500, message: error });
  }
};

exports.updateSingleUserAdminPanel = async (req, res) => {
  try {
    const payload = req.body;
    payload.updatedAt = new Date();
    const salt = await bcrypt.genSalt(parseInt(saltRounds));
    if (payload.passwordText) {
      var hash = await bcrypt.hash(payload.passwordText, salt);
      payload.password = hash;
    }
    const check = await User.findOne({
      _id: { $ne: payload.userId },
      email: payload.email,
    }).exec();
    if (check) {
      return res.status(200).json({
        status: false,
        message: "Email Already Exist!",
      });
    }
    const doc = await User.updateOne({ _id: payload.userId }, payload, {
      upsert: true,
    }).exec();

    if (!doc) {
      return res.status(404).send({
        success: false,
        message: "User Not Found!",
      });
    }
    const user = await User.findOne({ _id: payload.userId }).exec();
    return res.status(200).send({
      success: true,
      user,
      message: "User Profile Updated Successfully!",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await User.deleteOne({ _id: id }).exec();
    return res.status(200).json({
      success: true,
      message: "success",
      result,
    });
  } catch (e) {
    console.log("Error", e.message);
  }
};
