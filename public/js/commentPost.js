const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    cUsername: String,
    comments: String,
});

const Comment = mongoose.model('Comment', commentSchema, 'comment');

module.exports = Comment;