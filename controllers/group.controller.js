const GROUP = require("../models/group.js");
const mongoose = require("mongoose");

exports.index = function (req, res) {
  try {
    var pageNumber = req.body.pageNumber - 1;
    var perPage = 20;

    const { title, category, location } = req.body;
    const queryObject = {};

    GROUP.aggregate(
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
        const totalCount = await GROUP.countDocuments(queryObject).exec();

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
    const result = await GROUP.findOne({ _id: id }).exec();
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
      const check = await GROUP.findOne({
        title: obj.title,
        _id: { $ne: obj._id },
      }).exec();
      if (check) {
        return res.status(200).json({
          status: false,
          message: "Title group must be Unique!",
        });
      }
      if (obj._id) {
        result = await GROUP.updateOne({ _id: obj._id }, obj, { upsert: true });
      } else {
        result = await GROUP.create(payload);
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
    const result = await GROUP.find({}).exec();
    return res.status(200).json({
      success: true,
      message: "success",
      result,
    });
  } catch (e) {
    console.log("Error", e.message);
  }
};
