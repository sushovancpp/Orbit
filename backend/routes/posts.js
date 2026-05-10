const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadPostMedia } = require('../config/cloudinary');
const {
  createPost, getFeed, getPost, deletePost,
  toggleLike, addComment, votePoll,
} = require('../controllers/postController');

const router = express.Router();

router.get('/feed', protect, getFeed);
router.post('/', protect, uploadPostMedia.array('media', 10), createPost);
router.get('/:id', optionalAuth, getPost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.post('/:id/poll/vote', protect, votePoll);

module.exports = router;
