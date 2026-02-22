const Chat = require('../models/Chat');
const Message = require('../models/Message');

// @desc    Get or create a chat
// @route   POST /api/chat
// @access  Private
const accessChat = async (req, res) => {
    const { userId } = req.body; // ID of the user to chat with

    if (!userId) {
        return res.status(400).json({ message: "UserId param not sent with request" });
    }

    // Check if chat exists
    let isChat = await Chat.find({
        $and: [
            { participants: { $elemMatch: { $eq: req.user._id } } },
            { participants: { $elemMatch: { $eq: userId } } }
        ]
    }).populate("participants", "-password");

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        var chatData = {
            participants: [req.user._id, userId],
        };

        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("participants", "-password");
            res.status(200).send(FullChat);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

// @desc    Fetch all chats for a user
// @route   GET /api/chat
// @access  Private
const fetchChats = async (req, res) => {
    try {
        Chat.find({ participants: { $elemMatch: { $eq: req.user._id } } })
            .populate("participants", "-password")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                res.status(200).send(results);
            });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all Messages
// @route   GET /api/chat/:chatId/messages
// @access  Private
const allMessages = async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name email")
            .populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Create New Message
// @route   POST /api/chat/messages
// @access  Private
const sendMessage = async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        return res.status(400).json({ message: "Invalid data passed into request" });
    }

    var newMessage = {
        sender: req.user._id,
        text: content,
        chat: chatId,
    };

    try {
        var message = await Message.create(newMessage);

        message = await message.populate("sender", "name");
        message = await message.populate("chat");

        await Chat.findByIdAndUpdate(req.body.chatId, {
            updatedAt: Date.now() // to bump up the chat list
        });

        res.json(message);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { accessChat, fetchChats, allMessages, sendMessage };
