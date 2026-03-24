const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  college: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
