const express = require('express');
const { requestRental, getUserRentals, getOwnerRentals, updateRentalStatus, checkOverdueRentals } = require('../controllers/rentalController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Route to create a new rental request
router.post('/', protect, requestRental);

// Routes to get rentals for renter and owner
router.get('/my-rentals', protect, getUserRentals);
router.get('/owner-requests', protect, getOwnerRentals);

// Route to update a rental status
router.put('/:id/status', protect, updateRentalStatus);

// Route to manually check overdue (can be automated later)
router.post('/check-overdue', protect, checkOverdueRentals);

module.exports = router;
