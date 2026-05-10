const express = require('express');
const { protect } = require('../middleware/auth');
const { getNotifications, markAllRead, markOneRead, deleteNotification } = require('../controllers/notificationController');

const router = express.Router();

router.get('/', protect, getNotifications);
router.patch('/read-all', protect, markAllRead);
router.patch('/:id/read', protect, markOneRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
