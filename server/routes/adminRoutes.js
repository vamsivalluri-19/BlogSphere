const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getAllPosts,
  getAllComments,
  deleteUserByAdmin,
} = require('../controllers/adminController');
const { deletePost } = require('../controllers/postController');
const { deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.use(protect);
router.use(admin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/posts', getAllPosts);
router.get('/comments', getAllComments);

router.delete('/user/:id', deleteUserByAdmin);
router.delete('/post/:id', deletePost);
router.delete('/comment/:id', deleteComment);

module.exports = router;
