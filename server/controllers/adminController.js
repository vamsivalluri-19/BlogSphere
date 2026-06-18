const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @desc    Get dashboard analytics & stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalComments = await Comment.countDocuments();

    // Published vs Draft posts count
    const publishedPostsCount = await Post.countDocuments({ status: 'Published' });
    const draftPostsCount = await Post.countDocuments({ status: 'Draft' });

    // Active Users (users who have written at least one post)
    const activeAuthors = await Post.distinct('author');
    const totalActiveUsers = activeAuthors.length;

    // Get recent activity
    const recentPosts = await Post.find()
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    // Grouping registrations by month for charts (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of month

    const monthlyStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          usersCount: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const postStats = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          postsCount: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const commentStats = await Comment.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          commentsCount: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Format months for chart rendering (e.g. "Jan", "Feb")
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Build a continuous array of last 6 months
    const analyticsData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();

      const uMatch = monthlyStats.find((item) => item._id.month === m && item._id.year === y);
      const pMatch = postStats.find((item) => item._id.month === m && item._id.year === y);
      const cMatch = commentStats.find((item) => item._id.month === m && item._id.year === y);

      analyticsData.push({
        name: monthNames[d.getMonth()],
        Users: uMatch ? uMatch.usersCount : 0,
        Posts: pMatch ? pMatch.postsCount : 0,
        Comments: cMatch ? cMatch.commentsCount : 0,
      });
    }

    res.json({
      stats: {
        totalUsers,
        totalPosts,
        totalComments,
        publishedPostsCount,
        draftPostsCount,
        totalActiveUsers,
      },
      recentPosts,
      recentUsers,
      analyticsData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all posts list (moderation format)
// @route   GET /api/admin/posts
// @access  Private/Admin
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all comments list (moderation format)
// @route   GET /api/admin/comments
// @access  Private/Admin
const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('post', 'title slug')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/user/:id
// @access  Private/Admin
const deleteUserByAdmin = async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() === id) {
    return res.status(400).json({ message: 'You cannot delete yourself as an admin' });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optional cascade delete (delete user's posts and comments)
    await Post.deleteMany({ author: id });
    await Comment.deleteMany({ author: id });
    await user.deleteOne();

    res.json({ message: 'User and associated posts/comments deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllPosts,
  getAllComments,
  deleteUserByAdmin,
};
