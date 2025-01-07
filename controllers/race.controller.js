const RACE = require("../models/race");
const STAGE = require("../models/stage");
const RACEROUTE = require("../models/raceRoutes");
const FEEDBACKQUESTION = require("../models/feedBackQuestion");
const generateUniqueId = require("generate-unique-id");

const mongoose = require("mongoose");

exports.index = function (req, res) {
  try {
    var pageNumber = req.body.pageNumber - 1;
    var perPage = 20;

    const { text, category, location } = req.body;
    const queryObject = {};
    if (text) {
      queryObject.$or = [{ name: new RegExp(text, "i") }];
    }
    RACE.aggregate(
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
        const totalCount = await RACE.countDocuments(queryObject).exec();

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
    const result = await RACE.findOne({ _id: id }).exec();
    return res.status(200).json({
      success: true,
      message: "success",
      result,
    });
  } catch (e) {
    console.log("Error", e.message);
  }
};

exports.getSingleDetailMain = async (req, res, next) => {
  try {
    const { id } = req.params;

    const queryObject = { _id: mongoose.Types.ObjectId(id) };

    RACE.aggregate(
      [
        {
          $match: queryObject,
        },
        {
          $lookup: {
            from: "skins",
            localField: "skins",
            foreignField: "_id",
            as: "skin",
          },
        },
        {
          $lookup: {
            from: "groups",
            localField: "groups",
            foreignField: "_id",
            as: "group",
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

exports.Create = async (req, res, next) => {
  try {
    {
      let payload = req.body;

      const files = req.files;

      const obj = payload;

      let result;



      if (obj.domain) {
        const query = { domain: obj.domain };
        if (obj._id) query._id = { $ne: obj._id };
        const checkName = await RACE.findOne(query).exec();
        if (checkName) {
          return res.status(200).json({
            success: false,
            message: "RACE Domain must be unique!",
          });
        }
      }

      if (obj._id) {
        result = await RACE.updateOne({ _id: obj._id }, obj, { upsert: true });
      } else {
        const id2 = generateUniqueId({
          length: 8,
          useLetters: false,
        });
        payload.raceId = id2;
        result = await RACE.create(payload);
      }
      return res.status(200).json({
        success: true,
        result,
        raceId: obj._id ? obj._id : result._id,
        message: "Successfully!",
      });
    }
  } catch (e) {
    console.log("Error", e.message);
  }
};

exports.getAllGroups = async (req, res, next) => {
  try {
    const result = await RACE.find({}).exec();
    return res.status(200).json({
      success: true,
      message: "success",
      result,
    });
  } catch (e) {
    console.log("Error", e.message);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await RACE.deleteOne({ _id: id }).exec();
    return res.status(200).json({
      success: true,
      message: "success",
      result,
    });
  } catch (e) {
    console.log("Error", e.message);
  }
};

exports.copy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result1 = await RACE.findOne({ _id: id }).exec();
    const raceObject = JSON.parse(JSON.stringify(result1));
    const id2 = generateUniqueId({
      length: 8,
      useLetters: false,
    });
    raceObject.raceId = id2;
    delete raceObject._id;
    delete raceObject.id;
    delete raceObject.createdAt;
    delete raceObject.__v;
    delete raceObject.domain;
    console.log(raceObject);
    result = await RACE.create(raceObject);

    var queryObject = { raceId: mongoose.Types.ObjectId(id) };
    const stageObj = await STAGE.find(queryObject).exec();

    for (let y = 0; stageObj.length > y; y++) {
      const obj = JSON.parse(JSON.stringify(stageObj[y])); 
      obj.copiedBy = obj._id;
      delete obj._id;
      delete obj.id;
      delete obj.createdAt;
      obj.raceId = result._id;
      await STAGE.create(obj);
    }

    var queryObject = { raceId: mongoose.Types.ObjectId(id) };
    const raceObj = await RACEROUTE.find(queryObject).exec();

    for (let x = 0; raceObj.length > x; x++) {
      const obj = JSON.parse(JSON.stringify(raceObj[x]));
      const RoutesStages = [];

      for (let y = 0; obj.stageId.length > y; y++) {
        const selectedStageObj = obj.stageId[y];
        var queryObject = {
          raceId: mongoose.Types.ObjectId(result._id),
          copiedBy: selectedStageObj,
        };
        const stageObj = await STAGE.findOne(queryObject).exec();

        if (stageObj) {
          RoutesStages.push(stageObj);
        } 
      }

      delete obj._id;
      delete obj.id;
      delete obj.createdAt;
      obj.raceId = result._id;;
      obj.stageId = RoutesStages;
      await RACEROUTE.create(obj);
    }


    const oldresultFeedbackResult = await FEEDBACKQUESTION.find({ raceId: id }).exec();

    for (let z = 0; oldresultFeedbackResult.length > z; z++) {
      
      const selectedStageObj = JSON.parse(JSON.stringify(oldresultFeedbackResult[z])); 
     
      delete selectedStageObj._id;
      delete selectedStageObj.id;
      delete selectedStageObj.createdAt;
      selectedStageObj.raceId = result._id;;
      await FEEDBACKQUESTION.create(selectedStageObj);
    }

    return res.status(200).json({
      success: true,
      message: "success",
      result,
    });
  } catch (e) {
    console.log("Error", e.message);
  }
};
