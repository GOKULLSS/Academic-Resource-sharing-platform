const Rental = require('../models/Rental');
const Product = require('../models/Product');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

// Create a new rental request
exports.requestRental = async (req, res) => {
    try {
        const { productId, startDate, endDate, totalDays } = req.body;

        // Ensure the product exists and is for rent
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.transactionType !== 'Rent') {
            return res.status(400).json({ message: 'Product is not available for rent' });
        }
        if (product.seller.toString() === req.user.id) {
            return res.status(400).json({ message: 'You cannot rent your own product' });
        }

        // Calculate totals
        const rentPerDay = product.price;
        const deposit = product.deposit || 0;
        const totalAmount = (totalDays * rentPerDay) + deposit;

        // Create or find chat
        let chat = await Chat.findOne({
            participants: { $all: [req.user.id, product.seller] },
            product: productId,
        });

        if (!chat) {
            chat = await Chat.create({
                participants: [req.user.id, product.seller],
                product: productId,
            });
        }

        const rental = new Rental({
            product: productId,
            renter: req.user.id,
            owner: product.seller,
            startDate,
            endDate,
            totalDays,
            rentPerDay,
            deposit,
            totalAmount,
            chat: chat._id,
            status: 'Requested'
        });

        await rental.save();

        // System message
        await Message.create({
            chat: chat._id,
            sender: req.user.id,
            text: `Rental requested for ${totalDays} days for "${product.title}". Status: Requested`,
        });
        res.status(201).json({ message: 'Rental requested successfully', rental });
    } catch (error) {
        console.error('Error requesting rental:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get all rentals requested by the logged-in user (Renter view)
exports.getUserRentals = async (req, res) => {
    try {
        const rentals = await Rental.find({ renter: req.user.id })
            .populate('product', 'title image status')
            .populate('owner', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(rentals);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get all rental requests for products owned by the logged-in user (Owner view)
exports.getOwnerRentals = async (req, res) => {
    try {
        const rentals = await Rental.find({ owner: req.user.id })
            .populate('product', 'title image')
            .populate('renter', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(rentals);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update rental status (e.g., Approve, Return, Reject)
exports.updateRentalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const rental = await Rental.findById(id);
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        // Only owner can approve/reject or mark returned. (Simplify logic for now)
        if (rental.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        rental.status = status;

        // If Approved, update Product status to Rented
        if (status === 'Approved' || status === 'Active') {
            await Product.findByIdAndUpdate(rental.product, { status: 'Rented' });
        }

        // If Returned, update Product status back to live (available)
        if (status === 'Returned') {
            await Product.findByIdAndUpdate(rental.product, { status: 'live' });
        }

        await rental.save();

        if (rental.chat) {
            await Message.create({
                chat: rental.chat,
                sender: req.user.id,
                text: `Rental status updated to: ${status}`,
            });
        }
        res.status(200).json({ message: `Rental status updated to ${status}`, rental });
    } catch (error) {
        console.error('Error updating rental status:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Run a check to mark overdue rentals (can be called periodically or manually)
exports.checkOverdueRentals = async (req, res) => {
    try {
        const currentDate = new Date();
        // Find rentals that are past their end date and not yet returned
        const overdueRentals = await Rental.find({
            endDate: { $lt: currentDate },
            status: { $in: ['Active', 'Approved', 'Overdue'] }
        }).populate('chat');

        let processedCount = 0;

        for (const rental of overdueRentals) {
            
            // Calculate days overdue
            const end = new Date(rental.endDate);
            end.setHours(0, 0, 0, 0);
            const current = new Date(currentDate);
            current.setHours(0, 0, 0, 0);

            const diffTime = current - end;
            const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            
            if (diffDays > 0) {
                // Update status to overdue
                rental.status = 'Overdue';

                const expectedLateFee = diffDays * rental.rentPerDay;
                const alreadyCharged = rental.lateFee || 0;
                const feeToCharge = expectedLateFee - alreadyCharged;

                if (feeToCharge > 0) {
                    rental.lateFee = expectedLateFee;
                    rental.deposit = Math.max(0, rental.deposit - feeToCharge);
                    await rental.save();
                    processedCount++;

                    // System notification in chat
                    if (rental.chat) {
                        const chatMsg = `System: Product is overdue by ${diffDays} day(s). A late fee of ₹${feeToCharge} has been deducted. Remaining security deposit is ₹${rental.deposit}.`;
                        await Message.create({
                            chat: rental.chat._id,
                            sender: rental.owner, // System message sent by owner for visibility
                            text: chatMsg,
                        });
                    }
                }
            }
        }

        res.status(200).json({ message: 'Overdue rentals processed', count: processedCount });
    } catch (error) {
        console.error('Error checking overdue rentals:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
