const express = require('express');
const router = express.Router();
const { submitMessage, getMessages } = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', submitMessage);
router.get('/', protect, admin, getMessages);

module.exports = router;
