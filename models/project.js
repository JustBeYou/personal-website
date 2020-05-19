const {Schema, model} = require('mongoose');
const config = require('../config.json');

const projectSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    label: {
        type: String,
    },
    highlight: {
        type: Boolean,
    },
    ribbon: {
        type: String,
    }
});

module.exports = model('Project', projectSchema);