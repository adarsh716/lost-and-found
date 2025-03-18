const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

const getOtpExpiryTime = () => Date.now() + 10 * 60 * 1000;


exports.register = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();
    const otpExpiry = getOtpExpiryTime();

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      otp, 
      otpExpiry,
    });

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'OTP for Registration',
      text: `Your OTP is: ${otp}`,
    });

    console.log("Otp",otp)

    res.status(200).json({ msg: 'Registration successful, check your email for OTP' });
  } catch (err) {
    res.status(500).json({ msg: 'Error registering user', error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.status(200).json({ msg: 'Account verified successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Error verifying OTP', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    if (!user.isVerified) return res.status(400).json({ msg: 'Please verify your email first' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      msg: 'Login successful',
      token,
      userId: user._id,        
      fullName: user.fullName,  
      email: user.email,   
      phone: user.phoneNumber ,
      address: user.address ,
      friends: user.friends || [],
      blockedUsers : user.blockedUsers || []
    });
  } catch (err) {
    res.status(500).json({ msg: 'Error logging in', error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  try {

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ msg: 'New password cannot be the same as the current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ msg: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing password:', err); // Add this line to log the error
    res.status(500).json({ msg: 'Error changing password', error: err.message });
  }  
};
