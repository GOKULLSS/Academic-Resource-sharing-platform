const ContactMessage = require('../models/ContactMessage');

// @desc    Submit a new contact message
// @route   POST /api/contact
// @access  Public
const submitMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const contactMessage = new ContactMessage({ name, email, message });
        await contactMessage.save();
        res.status(201).json({ message: 'Message submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all contact messages (Admin)
// @route   GET /api/contact
// @access  Private/Admin
const getMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { submitMessage, getMessages };
