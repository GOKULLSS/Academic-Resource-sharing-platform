const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' } // Optional, to contextulize the chat
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
