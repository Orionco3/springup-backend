const mongoose = require('mongoose');

const contactResume = new mongoose.Schema({

    resumeData: { type: Object, default: {} },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },

    createdAt: { type: Date, requires: true, default: Date.now },
});

module.exports = mongoose.model('resumes', contactResume);
