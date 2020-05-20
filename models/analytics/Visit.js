const {Schema, model} = require('mongoose');

const visitSchema = new Schema({
    page: {
        type: String,
    },
    date: {
        type: Date,
    },
    user: {
        type: String,
    },
    time: {
        type: Number,
    },
});

module.exports = model('Visit', visitSchema);