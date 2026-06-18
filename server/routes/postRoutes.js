const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostByIdOrSlug,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Get all posts and create a post
router.route('/')
  .get(getPosts)
  .post(protect, createPost);

// File upload endpoint for post cover images
router.post('/upload', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // Return relative URL that can be fetched from the client
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

// Like / unlike post
router.post('/like/:id', protect, toggleLikePost);

// Get, update, and delete specific posts
router.route('/:idOrSlug')
  .get(getPostByIdOrSlug);

router.route('/:id')
  .put(protect, updatePost)
  .delete(protect, deletePost);

module.exports = router;
