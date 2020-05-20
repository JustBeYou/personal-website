const {Schema, model} = require('mongoose');

const readingSchema = new Schema({
    visitId: {
        type: String,
    },
    page: {
        type: String,
    },
    user: {
        type: String,
    },
    date: {
        type: Date,
    },

    target: {
        type: String,
    },
    time: {
        type: Number
    },
});

module.exports = model('Reading', readingSchema);