const express = require('express');
const router = express.Router();
const uploadProductImage = require('../config/cloudinaryConfig');
const { protect, admin } = require('../middleware/authMiddleware');
const {
    createProduct,
    getPendingProducts,
    approveProduct,
    deleteProduct,
    getLiveProducts,
    getMyProducts,
    updateProduct
} = require('../controllers/productController');

// Public route
router.get('/', getLiveProducts);
router.get('/my', protect, getMyProducts);


// Admin routes
router.get('/pending', protect, admin, getPendingProducts);
router.put('/:id/approve', protect, admin, approveProduct);

// Protected routes (Student/Admin)
router.post('/', protect, uploadProductImage.single('image'), createProduct);
router.put('/:id', protect, uploadProductImage.single('image'), updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
