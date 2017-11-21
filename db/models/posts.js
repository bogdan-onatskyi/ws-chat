const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const PostsSchema = new Schema({
    postId: String,
    timeStamp: String,
    userId: String,
    message: String,
    versionKey: false
});

module.exports = model('Posts', PostsSchema);