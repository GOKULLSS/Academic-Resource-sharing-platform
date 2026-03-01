const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    rentPerDay: { type: Number, required: true },
    deposit: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    lateFee: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['Requested', 'Approved', 'Active', 'Returned', 'Overdue', 'Rejected'],
        default: 'Requested'
    }
}, { timestamps: true });

module.exports = mongoose.model('Rental', rentalSchema);
