const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/test/users - Create test user
router.post('/users', async (req, res) => {
  try {
    const { name, email, phone, password, role, location } = req.body;

    const user = new User({
      name,
      email,
      phone,
      password,
      role,
      location
    });

    const savedUser = await user.save();

    // Convert to object and exclude password
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Test user created successfully',
      data: userResponse
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/test/users - Retrieve test users (excluding password)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
