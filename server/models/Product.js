const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String }, // Path to local upload or cloud URL
    transactionType: { type: String, enum: ['Buy', 'Rent'], required: true },
    status: { type: String, enum: ['pending', 'live', 'sold'], default: 'pending' },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
