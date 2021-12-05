const mongoose = require('mongoose');

const urlSchema = mongoose.Schema({
    longURL: {
        type: String,
        required: true
    },
    shortURL: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        expires: 3600,
        default: () => Date.now()
    }
})

const URL = mongoose.model('URL', urlSchema);

module.exports = URL;