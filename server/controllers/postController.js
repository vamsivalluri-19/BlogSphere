const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Get all posts (with search, category filter, pagination, author filter)
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const query = {};

    // Only return Published posts by default unless requested specifically (e.g. for author dashboard)
    if (req.query.status) {
      if (req.query.status !== 'All') {
        query.status = req.query.status;
      }
    } else {
      query.status = 'Published';
    }

    // Filter by category
    if (req.query.category) {
      query.category = { $regex: new RegExp('^' + req.query.category + '$', 'i') };
    }

    // Filter by tag
    if (req.query.tag) {
      query.tags = req.query.tag;
    }

    // Filter by author
    if (req.query.author) {
      query.author = req.query.author;
    }

    // Search term
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { excerpt: searchRegex },
        { tags: searchRegex },
      ];
    }

    const totalPosts = await Post.countDocuments(query);
    
    const posts = await Post.find(query)
      .populate('author', 'name email avatar bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      posts,
      page,
      pages: Math.ceil(totalPosts / limit),
      totalPosts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get post by ID or Slug
// @route   GET /api/posts/:idOrSlug
// @access  Public
const getPostByIdOrSlug = async (req, res) => {
  const { idOrSlug } = req.params;

  try {
    let post;

    // Check if parameter is a valid MongoDB ObjectId
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      post = await Post.findById(idOrSlug).populate('author', 'name email avatar bio');
    } else {
      post = await Post.findOne({ slug: idOrSlug }).populate('author', 'name email avatar bio');
    }

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new blog post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  const { title, content, excerpt, category, tags, status, featuredImage } = req.body;

  try {
    const parsedTags = Array.isArray(tags) ? tags : tags ? tags.split(',').map((t) => t.trim()) : [];

    const post = await Post.create({
      title,
      content,
      excerpt,
      category,
      tags: parsedTags,
      featuredImage: featuredImage || '',
      status: status || 'Draft',
      author: req.user._id,
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a blog post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content, excerpt, category, tags, status, featuredImage } = req.body;

  try {
    let post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Verify ownership or admin privileges
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to edit this post' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.excerpt = excerpt || post.excerpt;
    post.category = category || post.category;
    post.featuredImage = featuredImage !== undefined ? featuredImage : post.featuredImage;
    post.status = status || post.status;

    if (tags) {
      post.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
    }

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a blog post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Verify ownership or admin privileges
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like or unlike a blog post
// @route   POST /api/posts/like/:id
// @access  Private
const toggleLikePost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      // Already liked, unlike
      post.likes.splice(likeIndex, 1);
      await post.save();
      res.json({ message: 'Post unliked successfully', liked: false, likesCount: post.likes.length });
    } else {
      // Like post
      post.likes.push(req.user._id);
      await post.save();
      res.json({ message: 'Post liked successfully', liked: true, likesCount: post.likes.length });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPosts,
  getPostByIdOrSlug,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
};
