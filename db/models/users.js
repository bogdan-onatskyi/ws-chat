const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const UsersSchema = new Schema({
    userId: String,
    userName: String,
    password: String,
    isAdmin: Boolean,
    isBanned: Boolean,
    isMuted: Boolean,
    color: String,
});

module.exports = model('Users', UsersSchema);