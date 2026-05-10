const express = require('express');
const { protect } = require('../middleware/auth');
const { getChats, getChatMessages, createDM, createGroup, deleteMessage } = require('../controllers/chatController');

const router = express.Router();

router.get('/', protect, getChats);
router.get('/:id/messages', protect, getChatMessages);
router.post('/dm', protect, createDM);
router.post('/group', protect, createGroup);
router.delete('/:chatId/messages/:messageId', protect, deleteMessage);

module.exports = router;
