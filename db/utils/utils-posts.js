const Posts = require('../models/posts');

exports.getAllPosts = () => {
    return Posts.find();
};

exports.createPost = data => {
    // const {postId, timeStamp, userId, message} = data;
    const post = new Posts({...data});

    return post.save();
};

exports.deletePost = id => {
    return Posts.findById(id).remove();
};
