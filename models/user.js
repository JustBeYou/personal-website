const {Schema, model} = require('mongoose');
const passwordHash = require('password-hash');

const userSchema = new Schema({
    name: {
        type: String,
        require: true,
        unique: true,
    },

    password: {
        type: String,
        require: true,
    },

    email: {
        type: String,
        unique: true,
        require: true,
    },

    admin: {
        type: Boolean,
        default: false,
    }
});

userSchema.post('validate', (user) => {
    user.password = passwordHash.generate(user.password);
});

module.exports = model('User', userSchema);