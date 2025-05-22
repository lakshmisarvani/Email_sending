const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../sendEmail');

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const user = new User({
      name,
      email,
      password: hashedPassword,
      verificationToken,
    });

    await user.save();

    const verifyURL = `${process.env.CLIENT_URL}/verify/${verificationToken}`;

    const emailContent = `
      <p>Hello ${name},</p>
      <p>Thank you for signing up. Please verify your email by clicking the button below:</p>
      <p style="text-align:center; margin: 30px 0;">
        <a href="${verifyURL}" 
           style="
             background-color: #4CAF50; 
             color: white; 
             padding: 12px 24px; 
             text-decoration: none; 
             border-radius: 5px;
             display: inline-block;
           ">Verify Email</a>
      </p>
      <p>If you did not sign up for this account, please ignore this email.</p>
    `;

    await sendEmail(email, 'Verify your email', emailContent);

    res.status(201).json({ message: 'Signup successful. Please verify your email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) return res.status(400).json({ message: 'Invalid token' });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail(email, 'Password Reset', `<a href="${resetURL}">Click to reset password</a>`);

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email, resetToken: token });

    if (!user || user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password has been reset' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

module.exports = {
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
