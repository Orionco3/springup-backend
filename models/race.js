const mongoose = require("mongoose");

const contactSkin = new mongoose.Schema({
  raceId: { type: String, unique: true },
  name: { type: String, default: "" },

  groups: { type: mongoose.Schema.Types.ObjectId, ref: "group" },
  skins: { type: mongoose.Schema.Types.ObjectId, ref: "skin" },

  startDate: { type: String, default: "" },
  endDate: { type: String, default: "" },

  teamMinSize: { type: Number, default: 0 },
  teamMaxSize: { type: Number, default: 0 },

  domain: { type: String, default: "" },

  leaderBoard: { type: Boolean, default: false },
  discussionPoint: { type: Boolean, default: false },
  feedback: { type: Boolean, default: false },
  congrats: { type: Boolean, default: false },
  notification: { type: Boolean, default: false },
  userView: { type: Boolean, default: false },
  secarecard: { type: Boolean, default: false },
  skipEmail: { type: Boolean, default: false },
  autoFinishRace: { type: Boolean, default: false },
  
  correctCheckInCodeMessage: { type: String, default: "" },
  inCorrectCheckInCodeMessage: { type: String, default: "" },
  correctCheckOutCodeMessage: { type: String, default: "" },
  inCorrectCheckOutCodeMessage: { type: String, default: "" },

  regSuccessMesg: { type: String, default: "" },
  regSuccessButtonMesg: { type: String, default: "" },

  raceDatePassedMsg: { type: String, default: "" },
  raceDateNotStartedMsg: { type: String, default: "" },
  raceCompletedMsg: { type: String, default: "" },
  scorePageButtonText: { type: String, default: "" },

  pointPerSecand: { type: Number, default: 0 },
  penalityPerLocation: { type: Number, default: 0 },
  pointPerLocation: { type: Number, default: 0 },
  penalityPerQuestion: { type: Number, default: 0 },

  raceLogo: { type: String, default: "" },
  emailLogo: { type: String, default: "" },
  raceBackgroundLogo: { type: String, default: "" },

  vousher1: { type: String, default: "" },

  regForm: { type: Object, default: {} },

  welcomeMsg: { type: String, default: "" },
  finishMsg: { type: String, default: "" },
  emailRegForm: { type: String, default: "" },
  emailRegSubject: { type: String, default: "" },
  emailRegMessage: { type: String, default: "" },

  briefingType: { type: String, default: "" },
  raceBriefingInstruction: { type: String, default: "" },
  emergencyContactNo: { type: String, default: "" },
  raceBriefingMediaType: { type: String, default: "" },
  termsCondition: { type: String, default: "" },

  createdAt: { type: Date, requires: true, default: Date.now },
});

module.exports = mongoose.model("race", contactSkin);
false;
