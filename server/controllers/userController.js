const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcryptjs');

// @desc    Get user profile details
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('bookmarks', 'title slug excerpt featuredImage category createdAt')
      .populate('following', 'name email avatar bio');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile details (name, bio, avatar)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      bio: updatedUser.bio,
      bookmarks: updatedUser.bookmarks,
      following: updatedUser.following,
      isVerified: updatedUser.isVerified,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bookmark or unbookmark a post
// @route   POST /api/users/bookmark/:postId
// @access  Private
const toggleBookmark = async (req, res) => {
  const { postId } = req.params;

  try {
    const user = await User.findById(req.user._id);
    const post = await Post.findById(postId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const bookmarkIndex = user.bookmarks.indexOf(postId);

    if (bookmarkIndex > -1) {
      // Already bookmarked, remove it
      user.bookmarks.splice(bookmarkIndex, 1);
      await user.save();
      return res.json({ message: 'Removed bookmark successfully', bookmarked: false });
    } else {
      // Add bookmark
      user.bookmarks.push(postId);
      await user.save();
      return res.json({ message: 'Bookmarked successfully', bookmarked: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Follow or unfollow an author
// @route   POST /api/users/follow/:userId
// @access  Private
const toggleFollow = async (req, res) => {
  const { userId } = req.params;

  if (req.user._id.toString() === userId) {
    return res.status(400).json({ message: 'You cannot follow yourself' });
  }

  try {
    const user = await User.findById(req.user._id);
    const targetAuthor = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!targetAuthor) {
      return res.status(404).json({ message: 'Author not found' });
    }

    const followIndex = user.following.indexOf(userId);

    if (followIndex > -1) {
      // Already following, unfollow
      user.following.splice(followIndex, 1);
      await user.save();
      return res.json({ message: `Unfollowed ${targetAuthor.name}`, following: false });
    } else {
      // Follow
      user.following.push(userId);
      await user.save();
      return res.json({ message: `Following ${targetAuthor.name}`, following: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  toggleBookmark,
  toggleFollow,
};
