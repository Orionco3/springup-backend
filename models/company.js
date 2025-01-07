const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  avatar: { type: String, default: 'https://spotterverse.s3.amazonaws.com/11672916317775.png' },
  domain: { type: String, default: '', trim: true, lowercase: true },
  name: { type: String, default: '', trim: true, lowercase: true },
  industry: { type: String, default: '' },
  companySize: { type: String, default: '' },
  conutry: { type: String, default: '' },
  states: { type: String, default: '' },

  description: { type: String, default: '' },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  createdAt: { type: Date, requires: true, default: Date.now },
  isCompleted: { type: Boolean, default: false },

  companyIntroVideo: {
    videoUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    transcriptionJobName: { type: String, default: '' },
    transcriptFileUri: { type: String, default: '' },
  },
  companyCultureVideo: {
    videoUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    transcriptionJobName: { type: String, default: '' },
    transcriptFileUri: { type: String, default: '' },
  },
  companyFutureVideo: {
    videoUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    transcriptionJobName: { type: String, default: '' },
    transcriptFileUri: { type: String, default: '' },
  },
  setsYouApart: {
    videoUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    transcriptionJobName: { type: String, default: '' },
    transcriptFileUri: { type: String, default: '' },
  },
  anythingElse: {
    videoUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    transcriptionJobName: { type: String, default: '' },
    transcriptFileUri: { type: String, default: '' },
  },
});

module.exports = mongoose.model('company', companySchema);
