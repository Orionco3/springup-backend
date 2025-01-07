const RaceHistory = require('../models/raceHistory');
const Stage = require('../models/stage');
const Race = require('../models/race');
const mongoose = require("mongoose");

async function autoStageComplete() {
    try {

        const raceHistory = await RaceHistory.find({isCompleted : false}).exec();
       
        console.log("IN cron job");
       
        for (let x = 0; raceHistory.length > x; x++) {
            const mainObj = raceHistory[x];

            const stageObj = await Stage.findOne({_id :  mongoose.Types.ObjectId(mainObj.stageId)}).exec();

            const raceObj = await Race.findOne({_id : mongoose.Types.ObjectId(mainObj.raceId) }).exec();

            if (stageObj && raceObj) {

                let durationLeft =  calculateTimeLeft(mainObj.checkIn,  parseInt(stageObj.maxDuration));

                if(durationLeft == 0){
                    const obj = {
                      scoreSecondWin: -parseInt(raceObj.penalityPerLocation),
                      timeTaken: parseInt(stageObj.maxDuration),
                      timeSaved: 0,
                      penality: -parseInt(raceObj.penalityPerLocation),
                      isPenality: true,
                      isCompleted: true,
                      checkOut: new Date(),
                    };
                    await RaceHistory.updateOne({ _id: mainObj._id }, obj, {upsert: true});
                  }
            }
        }

    } catch (error) {
        console.log(error);
    }
}



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

module.exports = autoStageComplete;

