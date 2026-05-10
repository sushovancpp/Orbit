const express = require('express');
const { protect } = require('../middleware/auth');
const { uploadStory } = require('../config/cloudinary');
const { getStories, createStory, viewStory, deleteStory } = require('../controllers/storyController');

const router = express.Router();

router.get('/', protect, getStories);
router.post('/', protect, uploadStory.single('media'), createStory);
router.post('/:id/view', protect, viewStory);
router.delete('/:id', protect, deleteStory);

module.exports = router;
