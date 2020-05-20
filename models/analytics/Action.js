const {Schema, model} = require('mongoose');

const actionSchema = new Schema({
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
    
    type: {
        type: String,
    },
    target: {
        type: String,
    },
    count: {
        type: Number,
    }
});

module.exports = model('Action', actionSchema);