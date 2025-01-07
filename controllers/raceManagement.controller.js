const RACEHISTORY = require("../models/raceHistory");
const RACEFeedBack = require("../models/raceFeedBack");
const STAGE = require("../models/stage");
const RACE = require("../models/race");
const USER = require("../models/user");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const RaceRoutes = require("../models/raceRoutes");
const moment = require('moment');
const generateUniqueId = require("generate-unique-id");

const mongoose = require("mongoose");

exports.index = async function (req, res) {
  try {

    let currentStageId = "";
    let currentStageNumber = 0;

    let activeStageData = {
      isProgress: false,
      duration: 0
    };

    const payload = req.body;


    const raceResultId = await RACE.findOne({ _id: payload.raceId }).exec();

    for (let x = 0; payload.routes[0].stageId.length > x; x++) {
      console.log({
        userId: req.user,
        raceId: payload.raceId,
        stageId: payload.routes[0].stageId[x]._id,
      });
      const result = await RACEHISTORY.findOne({
        userId: req.user,
        raceId: payload.raceId,
        stageId: payload.routes[0].stageId[x],
      }).exec();
      console.log(result);
      if (result && result?.isCompleted === false) {

        currentStageId = payload.routes[0].stageId[x];
        currentStageId = await STAGE.findOne({ _id: currentStageId._id }).exec();
        currentStageNumber = x + 1;

        let durationLeft = calculateTimeLeft(result.checkIn, parseInt(currentStageId.maxDuration))

        if (durationLeft == 0) {
          const obj = {
            scoreSecondWin: -parseInt(raceResultId.penalityPerLocation),
            timeTaken: parseInt(currentStageId.maxDuration),
            timeSaved: 0,
            penality: -parseInt(raceResultId.penalityPerLocation),
            isPenality: true,
            isCompleted: true,
            checkOut: new Date(),
          };
          await RACEHISTORY.updateOne({ _id: result._id }, obj, { upsert: true });
        } else {
          activeStageData = {
            isProgress: true,
            duration: durationLeft
          }
          break;
        }

      }
      if (!result) {
        currentStageId = payload.routes[0].stageId[x];
        currentStageId = await STAGE.findOne({ _id: currentStageId._id }).exec();
        currentStageNumber = x + 1;
        activeStageData = {
          isProgress: false,
          duration: parseInt(currentStageId.maxDuration)
        }
        break;
      }
    }

    if (currentStageId) {
      currentStageId = await STAGE.findOne({ _id: currentStageId }).exec();
    } else {
      currentStageNumber = payload.routes[0].stageId.length;
    }
    return res.status(200).json({
      success: true,
      message: "success",
      currentStageId,
      currentStageNumber,
      activeStageData
    });
  } catch (e) {
    return res.status(200).json({
      success: false,
      message: "Something went wrong try again later!",
      e,
    });
  }
};


function calculateTimeLeft(checkInTime, duration) {
  // Convert duration to milliseconds
  let durationMilliseconds = duration * 1000; // Convert seconds to milliseconds

  // Calculate current time
  let currentTime = new Date();

  // Calculate the maximum checkout time based on the provided duration
  let maxCheckoutTime = new Date(checkInTime.getTime() + durationMilliseconds);

  // Calculate the time left in seconds
  let timeLeftInSeconds = Math.max(0, Math.floor((maxCheckoutTime - currentTime) / 1000));

  return timeLeftInSeconds;
}



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

exports.submitCheckIn = async (req, res, next) => {
  try {
    {
      let { raceId, currentStage, routes, currentStageNumber } = req. body;
      const raceResultId = await RACE.findOne({ _id: raceId }).exec();

      let result = await RACEHISTORY.findOne({
        userId: req.user,
        raceId,
        stageId: currentStage,
      }).exec();

      if (result) {
        const obj = {
          userId: req.user,
          raceId,
          raceRouteId: routes[0]._id,
          stageId: currentStage,
        };

        result = await RACEHISTORY.updateOne({ _id: result._id }, obj, {
          upsert: true,
        });
      } else if (!result) {

        const obj = {
          userId: req.user,
          raceId,
          raceRouteId: routes[0]._id,
          stageId: currentStage,
          checkIn: new Date(),
        };

        if(currentStageNumber == 0 & raceResultId.autoFinishRace){
          obj.checkOut = new Date();
          obj.isCompleted = true;
        }
        result = await RACEHISTORY.create(obj);
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

exports.submitStage = async (req, res, next) => {
  try {
    {
      let { finalSecond, currentStage, currentRace, raceRouteId } = req.body;

      currentStageId = await STAGE.findOne({ _id: currentStage._id }).exec();

      let result = await RACEHISTORY.findOne({
        userId: req.user,
        raceId: currentRace._id,
        stageId: currentStage._id,
      }).exec();

    
      let penality = 0;
      let isPenality = false;
      let isCheating = false;

      const timeTaken = parseInt(currentStage.maxDuration) - parseInt(finalSecond);

      if (parseInt(timeTaken) < parseInt(currentStage.minDuration)) {
        isCheating = true;
      }

      let scoreStageWin = parseInt(finalSecond) * parseInt(currentRace.pointPerSecand);

      if (finalSecond == 0) {
        scoreStageWin = -parseInt(currentRace.penalityPerLocation);
        penality = -parseInt(currentRace.penalityPerLocation);
        isPenality = true;
      }

      if (result && result.isCompleted === false) {
        const obj = {
          scoreSecondWin: parseInt(scoreStageWin),
          timeTaken: timeTaken,
          timeSaved: parseInt(finalSecond),
          penality: penality,
          isPenality,
          isCheating,
          isCompleted: true,
          userId: req.user,
          raceId: currentRace._id,
          stageId: currentStage._id,
          raceRouteId: raceRouteId,
          checkOut: new Date(),
        };

        result = await RACEHISTORY.updateOne({ _id: result._id }, obj, {
          upsert: true,
        });
      } else if (!result) {
        const obj = {
          scoreSecondWin: parseInt(scoreStageWin),
          timeTaken: parseInt(finalSecond),
          timeSaved: timeSaved,
          penality: penality,
          isPenality,
          isCompleted: true,
          isCheating,
          userId: req.user,
          raceId: currentRace._id,
          stageId: currentStage._id,
          raceRouteId: raceRouteId,
          checkOut: new Date(),
        };
        result = await RACEHISTORY.create(obj);
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

exports.raceFeedBackSubmit = async (req, res, next) => {
  try {
    {
      let payload = req.body;

      let result = await RACEFeedBack.findOne({
        userId: req.user,
        raceId: payload.raceData._id,
      }).exec();

      const obj = {
        feedBack: payload.feedBackData,
        userId: req.user,
        raceId: payload.raceData._id,
      };

      if (result) {
        result = await RACEFeedBack.updateOne({ _id: result._id }, obj, {
          upsert: true,
        });
      } else {
        result = await RACEFeedBack.create(obj);
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

exports.progressUser = async (req, res, next) => {
  try {
    {
      let payload = req.body;

      // Stage Graph

      const teamNameList = [];
      const dataPointWithColor = [];
      const pointScore = [];
      const obj = { raceId: payload.raceId }
      if (!payload.testUser) {
        obj.testUser = false;
      }
      const raceUsers = await USER.find(obj).exec();

      for (let x = 0; raceUsers.length > x; x++) {
        const user = raceUsers[x];

        const dataObj = {
          value: 0,
          itemStyle: {
            color: "black", // Color for the first bar
          },
        };

        const dataPointScoreObj = {
          value: 0,
          itemStyle: {
            color: "black", // Color for the first bar
          },
        };

        if (user && user.raceRouteId) {
          // console.log(user);
          const raceRoutes = await RaceRoutes.findOne({
            _id: user.raceRouteId,
          }).exec();
          // console.log(raceRoutes);
          if (raceRoutes.title && raceRoutes.stageId.length > 0) {
            dataObj.itemStyle.color = raceRoutes.title;
            dataPointScoreObj.itemStyle.color = raceRoutes.title;

            for (let y = 0; raceRoutes.stageId.length > y; y++) {
              const result = await RACEHISTORY.findOne({
                userId: user._id,
                raceId: payload.raceId,
                stageId: raceRoutes.stageId[y]._id,
              }).exec();
              if (result && result.isCompleted) {
                dataObj.value = dataObj.value + 1;
                dataPointScoreObj.value = dataObj.value + result.scoreSecondWin;
              }
            }
            teamNameList.push(user.teamName);
            dataPointWithColor.push(dataObj);
            pointScore.push(dataPointScoreObj);
          } else {
            teamNameList.push(user.teamName);
            dataPointWithColor.push(dataObj);
            pointScore.push(dataPointScoreObj);
          }
        }
      }
      return res.status(200).json({
        success: true,
        message: "Successfully!",
        stage: {
          teamNameList,
          dataPointWithColor,
          pointScore,
        },
      });
    }
  } catch (e) {
    console.log("Error", e.message);
  }
};

exports.progressUserListing = async (req, res, next) => {
  try {
    {
      let payload = req.body;

      // Stage Graph

      const userList = [];
      const obj = { raceId: payload.raceId }
      if (!payload.testUser) {
        obj.testUser = false;
      }
      const raceUsers = await USER.find(obj).exec();

      for (let x = 0; raceUsers.length > x; x++) {
        const user = raceUsers[x];
        let score = 0;
        let completedCount = 0;
        if (user && user.raceRouteId) {
          const result = await RACEHISTORY.find({
            userId: user._id,
            raceId: payload.raceId,
          }).exec();

          const raceRoutes = await RaceRoutes.findOne({
            _id: user.raceRouteId,
          }).exec();

          for (let y = 0; result.length > y; y++) {
            if (result[y].isCompleted) {
              score = score + result[y].scoreSecondWin;
              completedCount = completedCount + 1;
            }
          }

          user["score"] = score;
          const obj = {
            id: user._id,
            raceRouteId: user.raceRouteId,
            teamName: user.teamName,
            teamNo: user.teamNo,
            score: score,
            captainName: user.captainName,
            isCompleted:
              raceRoutes.stageId.length == completedCount ? true : false,
          };
          if (result.length > 0) {
            userList.push(obj);
          }
        }
      }
      let sortedUser = userList.sort((p1, p2) =>
        p1.score < p2.score ? 1 : p1.score > p2.score ? -1 : 0
      );
      return res.status(200).json({
        success: true,
        message: "Successfully d!",
        userList: sortedUser,
      });
    }
  } catch (e) {
    console.log("Error", e.message);
  }
};

exports.locationDetails = async (req, res, next) => {
  try {
    {
      let payload = req.body;
      console.log(payload.testUser);
      // Stage Graph
      const finalArray = [];
      const stageList = await STAGE.find({
        raceId: payload.raceId,
      }).exec();

      for (let x = 0; stageList.length > x; x++) {
        const stageObj = stageList[x];
        let checkedIn = 0;
        let pendingTeam = 0;

        const queryObjectUser = {
          raceId: payload.raceId,
        };
        if (!payload.testUser) {
          queryObjectUser.testUser = false;
        }

        const userList = await USER.find(queryObjectUser).exec();

        for (let y = 0; userList.length > y; y++) {
          const objUser = userList[y];

          const result = await RACEHISTORY.findOne({
            userId: objUser._id,
            raceId: payload.raceId,
            stageId: stageObj._id,
          }).exec();

          if (result) {
            checkedIn = checkedIn + 1;
          } else {
            pendingTeam = pendingTeam + 1;
          }
        }
        const queryObject = {
          raceId: mongoose.Types.ObjectId(payload.raceId),
          stageId: mongoose.Types.ObjectId(stageObj._id),
        };
        const pipeline = [
          {
            $match: queryObject,
          },
          {
            $group: {
              _id: "$stageId",
              totalScore: { $avg: "$timeTaken" },
              count: { $sum: 1 },
            },
          },
        ];
        const documents = await RACEHISTORY.aggregate(pipeline).exec();

        // const topUser = await RACEHISTORY.find(queryObject)
        //   .sort({ scoreSecondWin: -1 })
        //   .populate("userId")
        //   .limit(3)
        //   .exec();
        let matchQueryObject = [];
        if (!payload.testUser) {
          matchQueryObject = [{ "user.testUser": false }];
        } else {
          matchQueryObject = [
            { "user.testUser": true },
            { "user.testUser": false },
          ];
        }
        const topUser = await RACEHISTORY.aggregate([
          { $match: queryObject },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $match: {
              $or: matchQueryObject,
            },
          },
          { $sort: { scoreSecondWin: -1 } },
          { $limit: 3 },
        ]);
        // parseFloat("10.547892").toFixed(0);
        let avgCount =
          documents.length > 0 ? documents[0].totalScore / userList.length : 0;
        avgCount = parseFloat(avgCount).toFixed(0);

        const obj = {
          id: stageObj._id,
          title: stageObj.name,
          checkedIn: checkedIn,
          pendingTeam: pendingTeam,
          topUser: topUser,
          avgCount: avgCount,
        };
        finalArray.push(obj);
      }
      return res.status(200).json({
        success: true,
        message: "Successfully d!",
        userList: finalArray,
      });
    }
  } catch (e) {
    console.log("Error", e.message);
  }
};

exports.locationStageDetails = async (req, res, next) => {
  try {
    {
      let payload = req.body;

      // Stage Graph
      const stageList = await RACEHISTORY.find({
        stageId: payload.stageId,
      })
        .populate("stageId")
        .populate("raceId")
        .populate("userId")
        .exec();
      return res.status(200).json({
        success: true,
        message: "Successfully d!",
        stageList: stageList,
      });
    }
  } catch (e) {
    console.log("Error", e.message);
  }
};

exports.StageUserDetails = async (req, res, next) => {
  try {
    {
      let payload = req.body;

      // Stage Graph
      const stageList = await RACEHISTORY.find({
        userId: payload.userId,
      })
        .populate("stageId")
        .populate("raceId")
        .populate("userId")
        .exec();
      return res.status(200).json({
        success: true,
        message: "Successfully d!",
        stageList: stageList,
      });
    }
  } catch (e) {
    console.log("Error", e.message);
  }
};

exports.TopThreeScore = async (req, res, next) => {
  try {
    {
      let payload = req.body;

      // Stage Graph

      const userList = [];
      const raceUsers = await USER.find({ raceId: payload.raceId }).exec();

      for (let x = 0; raceUsers.length > x; x++) {
        const user = raceUsers[x];
        let score = 0;
        let completedCount = 0;
        if (user && user.raceRouteId) {
          const result = await RACEHISTORY.find({
            userId: user._id,
            raceId: payload.raceId,
          }).exec();

          const raceRoutes = await RaceRoutes.findOne({
            _id: user.raceRouteId,
          }).exec();

          for (let y = 0; result.length > y; y++) {
            if (result[y].isCompleted) {
              score = score + result[y].scoreSecondWin;
              completedCount = completedCount + 1;
            }
          }

          user["score"] = score;
          const obj = {
            id: user._id,
            raceRouteId: user.raceRouteId,
            teamName: user.teamName,
            teamNo: user.teamNo,
            score: score,
            captainName: user.captainName,
            isCompleted:
              raceRoutes.stageId.length == completedCount ? true : false,
          };
          if (score !== 0) {
            userList.push(obj);
          }
        }
      }
      let sortedUser = userList.sort((p1, p2) =>
        p1.score < p2.score ? 1 : p1.score > p2.score ? -1 : 0
      );
      return res.status(200).json({
        success: true,
        message: "Successfully d!",
        userList: sortedUser,
      });
    }
  } catch (e) {
    console.log("Error", e.message);
  }
};


exports.progressUserMax = async (req, res, next) => {
  try {
    {
      let payload = req.body;

      // Stage Graph

      const userList = [];
      const obj = { raceId: payload.raceId }
      if (!payload.testUser) {
        obj.testUser = false;
      }
      const raceUsers = await USER.find(obj).exec();

      const PATH = `${payload.raceId}_max.csv`
      for (let x = 0; raceUsers.length > x; x++) {
        const user = raceUsers[x];
        let score = 0;
        let completedCount = 0;
        if (user && user.raceRouteId) {
          const result = await RACEHISTORY.find({
            userId: user._id,
            raceId: payload.raceId,
          }).exec();

          const raceRoutes = await RaceRoutes.findOne({
            _id: user.raceRouteId,
          }).exec();

          for (let y = 0; result.length > y; y++) {
            if (result[y].isCompleted) {
              score = score + result[y].scoreSecondWin;
              completedCount = completedCount + 1;
            }
          }

          user["score"] = score;
          const obj = {
            id: user._id,
            raceRouteId: user.raceRouteId,
            email: user.email,
            teamName: user.teamName,
            teamNo: user.teamNo,
            score: score,
            captainName: user.captainName,
            isCompleted:
              raceRoutes.stageId.length == completedCount ? true : false,
          };
          if (score !== 0) {
            userList.push(obj);
          }
        }
      }
      let sortedUser = userList.sort((p1, p2) =>
        p1.score < p2.score ? 1 : p1.score > p2.score ? -1 : 0
      );





      const csvWriter = createCsvWriter({
        path: `upload/${PATH}`,
        header: [
          { id: "rank", title: "Rank" },
          { id: "teamName", title: "Team Name" },
          { id: "captainName", title: "Captain Name" },
          { id: "email", title: "Email" },
          { id: "locationPoint", title: "Location Points" },
          { id: "stageName", title: "Stage" },
          { id: "checkIn", title: "Check In" },
          { id: "checkOut", title: "Check Out" },
          { id: "time", title: "Time" },
          { id: "penality", title: "Penality" },
          { id: "points", title: "Points" },
          { id: "remarks", title: "Remarks" },
          { id: "review", title: "Review" },
        ],
      });


      const records = [
      ];

      for (let x = 0; sortedUser.length > x; x++) {
        const mainObj = sortedUser[x];
        const obj = {
          rank: x + 1,
          teamName: mainObj?.teamName,
          captainName: mainObj?.captainName,
          email: mainObj?.email,
          locationPoint: mainObj?.score
        }
        records.push(obj);
        const userStagesHistory = await RACEHISTORY.find({ userId: mainObj.id }).populate("stageId").exec();

        for (let y = 0; userStagesHistory.length > y; y++) {
          const mainObj = userStagesHistory[y];
          const obj = {
            stageName: mainObj?.stageId?.name,
            checkIn: moment(mainObj?.checkIn).format('HH:mm:ss'),
            checkOut: moment(mainObj?.checkOut).format('HH:mm:ss'),
            time: formatTime(mainObj?.timeTaken) + "",
            penality: mainObj?.isPenality ? 'YES' : 'NO',
            points: mainObj?.scoreSecondWin,
            remarks: mainObj?.isCheating ? 'Possible Cheating ' : '',
            review: '',
          }
          records.push(obj);

        }
      }

      csvWriter
        .writeRecords(records) // returns a promise
        .then(() => {
          console.log("...Done");
        });

      setTimeout(function () {
        return res.status(200).json({
          success: true,
          message: "Successfully!",
          PATH
        });
      }, 2000);


    }
  } catch (e) {
    console.log("Error", e.message);
  }

};

exports.progressUserMin = async (req, res, next) => {
  try {
    {
      let payload = req.body;

      // Stage Graph

      const userList = [];
      const obj = { raceId: payload.raceId }
      if (!payload.testUser) {
        obj.testUser = false;
      }
      const raceUsers = await USER.find(obj).exec();
      const PATH = `${payload.raceId}_min.csv`
      for (let x = 0; raceUsers.length > x; x++) {
        const user = raceUsers[x];
        let score = 0;
        let completedCount = 0;
        let isCheating = false;
        if (user && user.raceRouteId) {
          const result = await RACEHISTORY.find({
            userId: user._id,
            raceId: payload.raceId,
          }).exec();

          const raceRoutes = await RaceRoutes.findOne({
            _id: user.raceRouteId,
          }).exec();

          for (let y = 0; result.length > y; y++) {
            if (result[y].isCompleted) {
              score = score + result[y].scoreSecondWin;
              completedCount = completedCount + 1;
              if (result[y].isCheating) {
                isCheating = true;
              }
            }
          }

          user["score"] = score;
          const obj = {
            id: user._id,
            raceRouteId: user.raceRouteId,
            email: user.email,
            teamName: user.teamName,
            teamNo: user.teamNo,
            score: score,
            isCheating,
            captainName: user.captainName,
            isCompleted:
              raceRoutes.stageId.length == completedCount ? true : false,
          };
          if (score !== 0) {
            userList.push(obj);
          }
        }
      }
      let sortedUser = userList.sort((p1, p2) =>
        p1.score < p2.score ? 1 : p1.score > p2.score ? -1 : 0
      );





      const csvWriter = createCsvWriter({
        path: `upload/${PATH}`,
        header: [
          { id: "rank", title: "Rank" },
          { id: "teamName", title: "Team Name" },
          { id: "captainName", title: "Captain Name" },
          { id: "locationPoint", title: "Location Points" },
          { id: "remarks", title: "Possible Cheating" },
        ],
      });


      const records = [
      ];

      for (let x = 0; sortedUser.length > x; x++) {
        const mainObj = sortedUser[x];
        const obj = {
          rank: x + 1,
          teamName: mainObj?.teamName,
          captainName: mainObj?.captainName,
          email: mainObj?.email,
          locationPoint: mainObj?.score,
          remarks: mainObj?.isCheating ? "Yes" : "No"
        }
        records.push(obj);
      }
      console.log(records);
      csvWriter
        .writeRecords(records) // returns a promise
        .then(() => {
          console.log("...Done");
        });

      setTimeout(function () {
        return res.status(200).json({
          success: true,
          message: "Successfully!",
          PATH
        });
      }, 2000);
    }
  } catch (e) {
    console.log("Error", e.message);
  }

};


exports.updateDuration = async (req, res, next) => {
  try {
    {
      let payload = req.body;

      const history = payload.history;
      const durationInSec = parseInt(payload.durationInSec);

      const raceResultId = await RACE.findOne({ _id: payload.history.raceId }).exec();
      const currentStageId = await STAGE.findOne({ _id: payload.history.stageId }).exec();
      console.log(currentStageId.maxDuration);
      console.log(payload.durationInSec);
                                
      if ( parseInt(payload.durationInSec) > parseInt(currentStageId.maxDuration) || parseInt(payload.durationInSec) < 0) {
        return res.status(200).json({
          success: false,
          message: `Duration must be less then ${currentStageId.maxDuration}sec!`,
        });
      }


      // Convert duration to milliseconds
      let durationMilliseconds = durationInSec * 1000; // Convert seconds to milliseconds
      // Calculate the maximum checkout time based on the provided duration
      let checkIn = new Date(history.checkIn);

      let CheckoutTime = new Date(checkIn.getTime() + durationMilliseconds);

      let obj = {
        isPenality: false,
        penality: 0,
        scoreSecondWin: 0,
        isCheating: false,
        checkOut:'',
        timeTaken: 0,
        timeSaved: 0
      }
      obj.checkOut = CheckoutTime;
      obj.timeTaken = durationInSec;
      obj.timeSaved = parseInt(currentStageId.maxDuration) - durationInSec;
      if (durationInSec == currentStageId.maxDuration) {
        obj.isPenality = true;
        obj.penality = -parseInt(raceResultId.penalityPerLocation);
        obj.scoreSecondWin = -parseInt(raceResultId.penalityPerLocation);
      }else{
        obj.scoreSecondWin =parseInt(obj.timeSaved) * parseInt(raceResultId.pointPerSecand);
      }
      if (parseInt(obj.timeSaved) < parseInt(currentStageId.minDuration)) {
        obj.isCheating = true;
      }
      await RACEHISTORY.updateOne({ _id: history._id }, obj, { upsert: true });
      return res.status(200).json({
        success: true,
        message: "Successfully!",

      });

    }
  } catch (e) {
    console.log("Error", e.message);
  }

};


function formatTime(seconds) {
  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = seconds % 60;
  return  (minutes < 10 ? '0' : '') + minutes + ':' + (remainingSeconds < 10 ? '0' : '') + remainingSeconds;
}


