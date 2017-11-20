const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const PostsSchema = new Schema({
    postId: String,
    timeStamp: String,
    userId: String,
    message: String,
});

module.exports = model('Posts', PostsSchema);