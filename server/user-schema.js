const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
    userName: String,
    password: String,
    token: String,

    isAdmin: Boolean,
    isBanned: Boolean,
    isMuted: Boolean,

    color: String
});

module.exports = mongoose.model("User", userSchema);