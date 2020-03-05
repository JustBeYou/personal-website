const mongoose = require('mongoose');

const connectionString = 'mongodb+srv://littlewho:qwerty123456@littlewho-qbyk3.mongodb.net/test?retryWrites=true&w=majority';

module.exports = async () => {
    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB.');
};
