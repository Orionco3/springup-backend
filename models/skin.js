const mongoose = require('mongoose');

const contactSkin = new mongoose.Schema({

    title: { type: String, default: '' },
    appBackGround: { type: Object, default: { } },
    menuBar: { type: Object, default: { } },
    button: { type: Object, default: { } },
    text: { type: Object, default: { } },
    textBackground:{ type: Object, default: { } },
    createdAt: { type: Date, requires: true, default: Date.now },
});

module.exports = mongoose.model('skin', contactSkin);
