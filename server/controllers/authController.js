const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '3d',
    });
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, college } = req.body;

        if (!name || !email || !password || !college) {
            return res.status(400).json({ message: 'Please add all fields including college' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            if (userExists.isVerified) {
                return res.status(400).json({ message: 'User already exists and is verified. Please login.' });
            } else {
                // Resend OTP for unverified user
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins
                
                const salt = await bcrypt.genSalt(10);
                userExists.password = await bcrypt.hash(password, salt);
                userExists.name = name;
                userExists.college = college;
                userExists.otp = otp;
                userExists.otpExpires = otpExpires;
                await userExists.save();

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: userExists.email,
                    subject: 'OnCampusMart - OTP Verification',
                    text: `Your OTP for registration is ${otp}. It will expire in 5 minutes.`
                };
                
                try {
                    await transporter.sendMail(mailOptions);
                    return res.status(201).json({ message: 'Registration updated. Please verify your new OTP sent to email.', email: userExists.email });
                } catch (mailError) {
                    console.error("Error sending email:", mailError);
                    return res.status(201).json({ message: 'Registration completed but failed to send email. Check logs.', email: userExists.email });
                }
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            college,
            role: role || 'student', // Default to student
            otp,
            otpExpires
        });

        if (user) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'OnCampusMart - OTP Verification',
                text: `Your OTP for registration is ${otp}. It will expire in 5 minutes.`
            };
            
            try {
                await transporter.sendMail(mailOptions);
                res.status(201).json({ message: 'Registration successful. Please verify your OTP sent to email.', email: user.email });
            } catch (mailError) {
                console.error("Error sending email:", mailError);
                res.status(201).json({ message: 'Registration completed but failed to send email. Check logs.', email: user.email });
            }
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
            if (!user.isVerified) {
                return res.status(401).json({ message: 'Account not verified. Please verify OTP first.' });
            }
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
