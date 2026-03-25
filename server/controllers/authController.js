const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// Removed Resend and OTP dependencies
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '3d',
    });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, college } = req.body;

        if (!name || !email || !password || !college) {
            return res.status(400).json({ message: 'Please add all fields including college' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists. Please login.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            college,
            role: role || 'student',
            isVerified: true
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                college: user.college,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                college: user.college,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Provide email and OTP' });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }

        console.log(`[OTP VERIFICATION] Email: ${email}`);
        console.log(`[OTP VERIFICATION] User Input: '${otp}' | Database OTP: '${user.otp}'`);
        console.log(`[OTP VERIFICATION] Expiry Time: ${user.otpExpires} | Current Time: ${new Date()}`);

        // Convert to string and trim any accidental spaces before comparing
        const safeInputOtp = String(otp).trim();
        const safeDbOtp = String(user.otp).trim();

        if (safeDbOtp !== safeInputOtp || user.otpExpires.getTime() < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            college: user.college,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    verifyOtp,
};
