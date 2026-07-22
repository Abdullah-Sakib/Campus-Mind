const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

// @route POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { fullName, studentId, university, department, semester, email, password } = req.body;

    if (!fullName || !studentId || !university || !department || !semester || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existing) {
      return res.status(400).json({ message: 'Email or Student ID already registered' });
    }

    const user = await User.create({
      fullName,
      studentId,
      university,
      department,
      semester,
      email,
      password,
    });

    const token = signToken(user._id);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { emailOrStudentId, password } = req.body;

    if (!emailOrStudentId || !password) {
      return res.status(400).json({ message: 'Email/Student ID and password are required' });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrStudentId.toLowerCase() }, { studentId: emailOrStudentId }],
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user._id);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/google
// Simplified Google OAuth: client sends verified Google profile (email, name)
// obtained from Google Sign-In SDK on the frontend.
const googleAuth = async (req, res, next) => {
  try {
    const { email, fullName, studentId, university, department, semester } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    let user = await User.findOne({ email });

    if (!user) {
      if (!studentId || !university || !department || !semester) {
        return res.status(400).json({
          message: 'New Google account requires studentId, university, department, semester to complete signup',
        });
      }
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = await User.create({
        fullName: fullName || 'CampusMind User',
        studentId,
        university,
        department,
        semester,
        email,
        password: randomPassword,
        authProvider: 'google',
      });
    }

    const token = signToken(user._id);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/forgot-password
// Generates a reset token (in production, email this link to the user)
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond success to avoid leaking which emails are registered
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = resetTokenExpires;
    await user.save({ validateBeforeSave: false });

    // In production: send resetToken via email
    res.json({
      message: 'If that email exists, a reset link has been sent.',
      devResetToken: resetToken, // exposed for local testing only
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset token is invalid or has expired' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};

module.exports = { signup, login, googleAuth, forgotPassword, resetPassword, getMe };
