const STAGE = require("../models/stage");
const RACEROUTE = require("../models/raceRoutes");
const mongoose = require("mongoose");

exports.index = function (req, res) {
  try {
    var pageNumber = req.body.pageNumber - 1;
    var perPage = 20;

    const { raceId } = req.body;

    const queryObject = { raceId: mongoose.Types.ObjectId(raceId) };

    STAGE.aggregate(
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
        const totalCount = await STAGE.countDocuments(queryObject).exec();

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
    const result = await STAGE.findOne({ _id: id }).exec();
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

      let queryObject = {};
      if (obj.endLocation) {
        queryObject = {
          raceId: obj.raceId,
          endLocation: true,
        };
        if (obj._id) {
          queryObject._id = { $ne: obj._id };
        }
        const result = await STAGE.find(queryObject).exec();
        if (result.length > 0) {
          return res.status(200).json({
            success: false,
            result,
            message: "Your race already has a Last Stage! ",
          });
        }
      }

      if (obj.startLocation) {
        queryObject = {
          raceId: obj.raceId,
          startLocation: true,
        };
        if (obj._id) {
          queryObject._id = { $ne: obj._id };
        }
        const result = await STAGE.find(queryObject).exec();
        if (result.length > 0) {
          return res.status(200).json({
            success: false,
            result,
            message: "Your race already has a Start Stage! ",
          });
        }
      }

      if (obj.name) {
        const query = { raceId: obj.raceId, name: obj.name };
        if (obj._id) query._id = { $ne: obj._id };
        const checkName = await STAGE.findOne(query).exec();
        if (checkName) {
          return res.status(200).json({
            success: false,
            message: "Stage Name must be unique!",
          });
        }
      }

      let result;
      if (obj._id) {
        result = await STAGE.updateOne({ _id: obj._id }, obj, { upsert: true });
      } else {
        const raceRouteCheck = await RACEROUTE.find({
          raceId: obj.raceId,
        }).exec();
        if (raceRouteCheck.length > 0) {
          return res.status(200).json({
            success: false,
            result,
            message: "New Stage Only created when there is no Route!",
          });
        }
        result = await STAGE.create(payload);
      }
      return res.status(200).json({
        success: true,
        result,
        message: "Stage saved successfully!",
      });
    }
  } catch (e) {
    console.log("Error", e.message);
  }
};

exports.getAllGroups = async (req, res, next) => {
  try {
    const result = await STAGE.find({}).exec();
    return res.status(200).json({
      success: true,
      message: "success",
      result,
    });
  } catch (e) {
    console.log("Error", e.message);
  }
};

exports.getAllRaceStages = async (req, res, next) => {
  try {
    const { raceId } = req.params;

    var queryObject = { raceId: mongoose.Types.ObjectId(raceId) };

    const result = await STAGE.find(queryObject).exec();

    queryObject.endLocation = { $ne: true };
    queryObject.startLocation = { $ne: true };

    const resultWithoutLocation = await STAGE.find(queryObject).exec();

    queryObject.startLocation = true;
    queryObject.endLocation = false;

    const resultWithStartLocation = await STAGE.find(queryObject).exec();

    queryObject.startLocation = false;
    queryObject.endLocation = true;

    const resultWithEndLocation = await STAGE.find(queryObject).exec();

    return res.status(200).json({
      success: true,
      message: "success",
      result,
      resultWithoutLocation,
      resultWithStartLocation,
      resultWithEndLocation,
    });
  } catch (e) {
    console.log("Error", e.message);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id, raceId } = req.params;

    var queryObject = { raceId: mongoose.Types.ObjectId(raceId) };
    const checkRoute = await RACEROUTE.find(queryObject).exec();

    if (checkRoute.length > 0) {
      return res.status(200).json({
        success: false,
        message: "Delete All Routes first to Delete Stage!",
      });
    }

    const result = await STAGE.deleteOne({ _id: id }).exec();
    return res.status(200).json({
      success: true,
      message: "success",
      result,
    });
  } catch (e) {
    console.log("Error", e.message);
  }
};
