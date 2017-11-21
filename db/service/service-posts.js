const Posts = require('../models/posts');

exports.getAllPosts = () => {
    return Posts.find();
};

exports.createPost = data => {
    // const {postId, timeStamp, userId, message} = data;
    const post = new Posts({...data});

    return post.save();

    //
    // post.save(function(err){
    //     mongoose.disconnect();
    //
    //     if(err) return console.log(err);
    //
    //     console.log(`Сохранен объект post: ${post}`);
    // });

};

exports.deletePost = id => {
    return Posts.findById(id).remove();
};
