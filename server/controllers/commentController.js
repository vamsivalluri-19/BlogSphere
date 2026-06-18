const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @desc    Get comments for a blog post
// @route   GET /api/comments/:postId
// @access  Public
const getCommentsByPostId = async (req, res) => {
  const { postId } = req.params;

  try {
    // Find all comments for this post, sorted from oldest to newest (so replies appear in chronological order)
    const comments = await Comment.find({ post: postId }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a comment (or reply to a comment)
// @route   POST /api/comments
// @access  Private
const createComment = async (req, res) => {
  const { content, post, parentComment } = req.body;

  try {
    const postExists = await Post.findById(post);
    if (!postExists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const commentData = {
      content,
      post,
      author: req.user._id,
      parentComment: parentComment || null,
    };

    const comment = await Comment.create(commentData);

    // If this is a reply, push the reply ID to the parent comment's replies array
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (parent) {
        parent.replies.push(comment._id);
        await parent.save();
      }
    }

    // Populate author manually for returning the newly created comment
    const populatedComment = await Comment.findById(comment._id);

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update comment content
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check ownership
    if (comment.author._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this comment' });
    }

    comment.content = content;
    const updatedComment = await comment.save();

    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete comment (and recursively delete its replies)
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
  const { id } = req.params;

  try {
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check ownership or admin role
    if (comment.author._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this comment' });
    }

    // Helper function to recursively delete replies
    const deleteRepliesRecursive = async (commentId) => {
      const comm = await Comment.findById(commentId);
      if (comm) {
        for (const replyId of comm.replies) {
          await deleteRepliesRecursive(replyId);
        }
        await comm.deleteOne();
      }
    };

    // If it has a parent, remove this comment from the parent's replies list
    if (comment.parentComment) {
      const parent = await Comment.findById(comment.parentComment);
      if (parent) {
        parent.replies = parent.replies.filter((rId) => rId.toString() !== id);
        await parent.save();
      }
    }

    // Delete comment and all its child replies
    await deleteRepliesRecursive(id);

    res.json({ message: 'Comment and replies deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCommentsByPostId,
  createComment,
  updateComment,
  deleteComment,
};
