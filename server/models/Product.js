const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    college: { type: String, required: true },
    image: { type: String, required: true }, // Cloudinary URL
    transactionType: { type: String, enum: ['Buy', 'Rent'], required: true },
    deposit: { type: Number, default: 0 }, // For Rentals
    condition: { type: String, enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'] }, // Specific to Rent, can apply to Buy too
    lateFeePerDay: { type: Number, default: 0 }, // Penalty fee
    status: { type: String, enum: ['pending', 'live', 'sold', 'Rented'], default: 'pending' },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
