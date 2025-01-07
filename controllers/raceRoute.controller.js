const RACEROUTE = require("../models/raceRoutes");
const RACEHISTORY = require("../models/raceHistory");
const User = require("../models/user");
const STAGE = require("../models/stage");
const mongoose = require("mongoose");

exports.index = function (req, res) {
  try {
    var pageNumber = req.body.pageNumber - 1;
    var perPage = 20;

    const { title, category, location, raceId } = req.body;
    const queryObject = { raceId: mongoose.Types.ObjectId(raceId) };

    RACEROUTE.aggregate(
      [
        {
          $match: queryObject,
        },
        {
          $sort: {
            _id: -1,
          },
        },
        // {
        //   $limit: pageNumber * perPage + 20,
        // },
      ],
      async function (err, documents) {
        const totalCount = await RACEROUTE.countDocuments(queryObject).exec();
        const data = documents;
        for (let y = 0; documents.length > y; y++) {
          const obj = documents[y].stageId;
          
          const stageId = [];
          for (let x = 0; obj.length > x; x++) {
            const result = await STAGE.findOne({ _id: obj[x]._id }).exec();
            stageId.push(result);
          }
          data[y].stageId = stageId;
        }

        if (err) {
          return res.status(200).json({
            status: false,
            message: "Something went wrong !",
          });
        } else {
          return res.status(200).json({
            success: true,
            message: "Data Retrieve Successfully!",
            data: data,
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
    const documents = await RACEROUTE.findOne({ _id: id }).exec();

    const obj = documents.stageId;
    const stageId = [];
    for (let x = 0; obj.length > x; x++) {
      const result = await STAGE.findOne({ _id: obj[x]._id }).exec();
      stageId.push(result);
    }
    documents.stageId = stageId;

    return res.status(200).json({
      success: true,
      message: "success",
      result: documents,
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

      console.log(obj);

      const check = await RACEROUTE.findOne({
        _id: { $ne: obj._id },
        raceId: obj.raceId,
        title: obj.title,
      }).exec();
      if (check) {
        return res.status(200).json({
          status: false,
          message: "Title Route must be Unique!",
        });
      }

      if (obj._id) {
        const checkRoutes = await RACEHISTORY.findOne({
          raceRouteId: obj._id,
        }).exec();
        if (checkRoutes) {
          return res.status(200).json({
            success: false,
            message: "Route is Already Running!",
          });
        }
        result = await RACEROUTE.updateOne({ _id: obj._id }, obj, {
          upsert: true,
        });
      } else {
        result = await RACEROUTE.create(payload);
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
    const result = await RACEROUTE.find({}).exec();
    return res.status(200).json({
      success: true,
      message: "success",
      result,
    });
  } catch (e) {
    console.log("Error", e.message);
  }
};

exports.delete = async (req, res) => {
  try {
    const { id, raceId } = req.params;

    var queryObject = { raceId: mongoose.Types.ObjectId(raceId) };
    const checkUser = await User.find(queryObject).exec();

    if (checkUser.length > 0) {
      return res.status(200).json({
        success: false,
        message: "Delete All Users first to Delete Routes!",
      });
    }

    const result = await RACEROUTE.deleteOne({ _id: id }).exec();
    const result1 = await User.deleteMany({ raceId: id }).exec();
    return res.status(200).json({
      success: true,
      message: "success",
      result,
    });
  } catch (e) {
    console.log("Error", e.message);
  }
};
