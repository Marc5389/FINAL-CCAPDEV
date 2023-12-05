const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    cUsername: String,
    comment: String,
});

const postSchema = new mongoose.Schema({
    user_Image: String,
    caption: String,
    description: String,
    datePosted: Date,
    bio: String,
    ratingValue: Number,
    imageFile: String,
    username: String,
    comments: [commentSchema], // Embedding comments directly within the post schema
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likeCount: { type: Number, default: 0 }
    
});

const Post = mongoose.model('Post', postSchema, 'post');

module.exports = Post;
