const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // Prevent creating admin users through registration
    if (role === 'admin') {
      return res.status(403).json({ message: 'Cannot create admin account through registration' });
    }

    // Prevent registering with admin email
    if (email.toLowerCase() === 'admin@gmail.com') {
      return res.status(403).json({ message: 'This email is reserved for admin' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user (always as regular user)
    const user = await User.create({
      name,
      email,
      password,
      role: 'user', // Force role to be 'user'
    });

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Normalize email to lowercase (matching schema)
    const normalizedEmail = email.toLowerCase().trim();

    // Check for user
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      console.log(`Login failed: User not found for email: ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`Login attempt for: ${normalizedEmail}, User found: ${user.email}, Role: ${user.role}`);

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.log(`Login failed: Password mismatch for: ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`Login successful for: ${normalizedEmail}, Role: ${user.role}`);

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

