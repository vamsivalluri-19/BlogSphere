const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Please add comment content'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Populate author information on queries automatically
commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'author',
    select: 'name email avatar role',
  });
  next();
});

module.exports = mongoose.model('Comment', commentSchema);
