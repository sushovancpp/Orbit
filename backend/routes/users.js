const express = require('express');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../config/cloudinary');
const {
  getProfile, updateProfile, toggleFollow,
  getFollowers, getFollowing, searchUsers, getSuggestedUsers,
} = require('../controllers/userController');

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/suggested', protect, getSuggestedUsers);
router.get('/:username', protect, getProfile);
router.put('/me', protect, uploadAvatar.single('avatar'), updateProfile);
router.post('/:id/follow', protect, toggleFollow);
router.get('/:id/followers', protect, getFollowers);
router.get('/:id/following', protect, getFollowing);

module.exports = router;
