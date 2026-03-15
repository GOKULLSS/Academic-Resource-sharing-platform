const cron = require('node-cron');
const mongoose = require('mongoose');
const Rental = require('../models/Rental');
const Message = require('../models/Message');

const checkOverdueRentalsJob = () => {
    // Run every day at midnight (0 0 * * *)
    // For testing, user might change this
    cron.schedule('0 0 * * *', async () => {
        console.log('Running nightly overdue rental check...');
        try {
            const currentDate = new Date();
            
            // Find rentals that are past their end date and match status
            // that we care about tracking deposit deductions
            const overdueRentals = await Rental.find({
                endDate: { $lt: currentDate },
                status: { $in: ['Active', 'Approved', 'Overdue'] }
            }).populate('chat');

            let processedCount = 0;

            for (const rental of overdueRentals) {
                // Calculate days overdue
                const end = new Date(rental.endDate);
                // Set times to midnight to calculate difference in days accurately
                end.setHours(0, 0, 0, 0);
                const current = new Date(currentDate);
                current.setHours(0, 0, 0, 0);

                const diffTime = current - end;
                const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                
                if (diffDays > 0) {
                    // Update status to overdue if not already
                    if (rental.status !== 'Overdue') {
                        rental.status = 'Overdue';
                    }

                    // Total late fee that SHOULD be charged at this point in time
                    // If the product model has lateFeePerDay we could populate and use it. 
                    // Fallback to rentPerDay. Assuming rental.rentPerDay for now.
                    const expectedLateFee = diffDays * rental.rentPerDay;
                    
                    // The difference between expected and what has already been charged
                    const alreadyCharged = rental.lateFee || 0;
                    const feeToCharge = expectedLateFee - alreadyCharged;

                    if (feeToCharge > 0) {
                        // We need to charge this new fee
                        rental.lateFee = expectedLateFee;
                        
                        // Deduct from deposit
                        rental.deposit = Math.max(0, rental.deposit - feeToCharge);
                        
                        await rental.save();
                        processedCount++;

                        // Notify in chat
                        if (rental.chat) {
                            const chatMsg = `System: Product is overdue by ${diffDays} day(s). A late fee of ₹${feeToCharge} has been deducted. Remaining security deposit is ₹${rental.deposit}.`;
                            const newMsg = await Message.create({
                                chat: rental.chat._id,
                                sender: rental.owner, // Send on behalf of owner or system
                                text: chatMsg,
                            });
                        }
                    }
                }
            }
            console.log(`Nightly overdue check complete. Processed ${processedCount} rentals.`);
        } catch (error) {
            console.error('Error during nightly overdue rental check:', error);
        }
    });
};

module.exports = checkOverdueRentalsJob;
