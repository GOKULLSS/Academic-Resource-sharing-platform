const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, admin } = require('../middleware/authMiddleware');
const {
    createProduct,
    getPendingProducts,
    approveProduct,
    deleteProduct,
    getLiveProducts,
    getMyProducts
} = require('../controllers/productController');

// Public route
router.get('/', getLiveProducts);
router.get('/my', protect, getMyProducts);


// Admin routes
router.get('/pending', protect, admin, getPendingProducts);
router.put('/:id/approve', protect, admin, approveProduct);

// Protected routes (Student/Admin)
router.post('/', protect, upload.single('image'), createProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
