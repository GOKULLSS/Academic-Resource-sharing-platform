const Product = require('../models/Product');

// @desc    Create a product (Student)
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
    try {
        const { title, description, price, category, transactionType, deposit } = req.body;

        let imagePath = '';
        if (req.file) {
            // Store the path relative to the server or full URL, for simplicity we store relative
            imagePath = `/uploads/${req.file.filename}`;
        }

        const product = await Product.create({
            title,
            description,
            price,
            category,
            transactionType,
            deposit: deposit || 0,
            image: imagePath,
            seller: req.user.id,
            status: 'pending' // Enforcing pending status
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all pending products (Admin)
// @route   GET /api/products/pending
// @access  Private/Admin
const getPendingProducts = async (req, res) => {
    try {
        const products = await Product.find({ status: 'pending' }).populate('seller', 'name email');
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve/Update product status (Admin)
// @route   PUT /api/products/:id/approve
// @access  Private/Admin
const approveProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.status = 'live';
        const updatedProduct = await product.save();

        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product (Admin or Seller)
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check user
        if (req.user.role !== 'admin' && product.seller.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await product.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get live products
// @route   GET /api/products
// @access  Public
const getLiveProducts = async (req, res) => {
    try {
        const { category, type } = req.query;
        let query = { status: 'live' };

        if (category) query.category = category;
        if (type) query.transactionType = type;

        const products = await Product.find(query).populate('seller', 'name').sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get logged-in user's products
// @route   GET /api/products/my
// @access  Private
const getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createProduct,
    getPendingProducts,
    approveProduct,
    deleteProduct,
    getLiveProducts,
    getMyProducts
};
