const SKIN = require("../models/skin");
const mongoose = require("mongoose");

exports.index = function (req, res) {
  try {
    var pageNumber = req.body.pageNumber - 1;
    var perPage = 20;

    const { title, category, location } = req.body;
    const queryObject = {};

    SKIN.aggregate(
      [
        {
          $match: queryObject,
        },
        {
          $sort: {
            _id: -1,
          },
        },
        {
          $limit: pageNumber * perPage + 20,
        },
      ],
      async function (err, documents) {
        const totalCount = await SKIN.countDocuments(queryObject).exec();

        if (err) {
          return res.status(200).json({
            status: false,
            message: "Something went wrong !",
          });
        } else {
          return res.status(200).json({
            success: true,
            message: "Data Retrieve Successfully!",
            data: documents,
            totalCount,
          });
        }
      }
    );
  } catch (e) {
    return res.status(200).json({
      success: false,
      message: "Something went wrong try again later!",
      e,
    });
  }
};

exports.getSingleDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await SKIN.findOne({ _id: id }).exec();
    return res.status(200).json({
      success: true,
      message: "success",
      result,
    });
  } catch (e) {
    console.log("Error", e.message);
  }
};

exports.Create = async (req, res, next) => {
  try {
    {
      let payload = req.body;

      const obj = payload;
      let result;
      const check = await SKIN.findOne({
        _id: { $ne: obj._id },
        title: obj.title,
      }).exec();
      if (check) {
        return res.status(200).json({
          status: false,
          message: "Title SKIN must be Unique!",
        });
      }
      if (obj._id) {
        result = await SKIN.updateOne({ _id: obj._id }, obj, { upsert: true });
      } else {
        result = await SKIN.create(payload);
      }
      return res.status(200).json({
        success: true,
        result,
        message: "Successfully!",
      });
    }
  } catch (e) {
    console.log("Error", e.message);
  }
};

exports.getAllGroups = async (req, res, next) => {
  try {
    const result = await SKIN.find({}).exec();
    return res.status(200).json({
      success: true,
      message: "success",
      result,
    });
  } catch (e) {
    console.log("Error", e.message);
  }
};
