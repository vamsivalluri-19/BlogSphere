const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  toggleBookmark,
  toggleFollow,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, changePassword);
router.post('/bookmark/:postId', protect, toggleBookmark);
router.post('/follow/:userId', protect, toggleFollow);

module.exports = router;
