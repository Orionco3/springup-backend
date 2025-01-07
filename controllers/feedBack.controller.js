const FEEDBACKQUESTION = require("../models/feedBackQuestion");
const RACEFEEDBACK = require("../models/raceFeedBack");

const mongoose = require("mongoose");

exports.index = function (req, res) {
  try {
    var pageNumber = req.body.pageNumber - 1;
    var perPage = 20;

    const { title, category, location } = req.body;

    const { raceId } = req.body;

    const queryObject = { raceId: mongoose.Types.ObjectId(raceId) };

    FEEDBACKQUESTION.aggregate(
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
        const totalCount = await FEEDBACKQUESTION.countDocuments(
          queryObject
        ).exec();

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
    const result = await FEEDBACKQUESTION.findOne({ _id: id }).exec();
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
      console.log(obj);
      let result;
      if (obj._id) {
        result = await FEEDBACKQUESTION.updateOne({ _id: obj._id }, obj, {
          upsert: true,
        });
      } else {
        result = await FEEDBACKQUESTION.create(payload);
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
    const { raceId } = req.body;

    const queryObject = { raceId: mongoose.Types.ObjectId(raceId) };

    const result = await FEEDBACKQUESTION.find(queryObject).exec();
    return res.status(200).json({
      success: true,
      message: "success",
      result,
    });
  } catch (e) {
    console.log("Error", e.message);
  }
};

exports.getAllTeamsRaceFeedback = async (req, res, next) => {
  try {
    const { raceId } = req.body;
    const queryObject = { raceId: mongoose.Types.ObjectId(raceId) };

    RACEFEEDBACK.aggregate(
      [
        {
          $match: queryObject,
        },
        { $unwind: "$feedBack" },
        {
          $lookup: {
            from: "races",
            localField: "feedBack.raceId",
            foreignField: "_id",
            as: "question",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
      ],
      async function (err, documents) {
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
          });
        }
      }
    );
  } catch (e) {
    console.log("Error", e.message);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await FEEDBACKQUESTION.deleteOne({ _id: id }).exec();
    return res.status(200).json({
      success: true,
      message: "success",
      result,
    });
  } catch (e) {
    console.log("Error", e.message);
  }
};
