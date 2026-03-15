const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products', 
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const uploadProductImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = uploadProductImage;
