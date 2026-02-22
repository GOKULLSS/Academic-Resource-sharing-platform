const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { accessChat, fetchChats, allMessages, sendMessage } = require('../controllers/chatController');

const router = express.Router();

router.post('/', protect, accessChat);
router.get('/', protect, fetchChats);
router.post('/messages', protect, sendMessage);
router.get('/:chatId/messages', protect, allMessages);

module.exports = router;
