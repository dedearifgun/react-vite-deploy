const User = require('../models/userModel');
const { logAudit } = require('../utils/audit');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email atau username sudah terdaftar'
      });
    }

    // Create user
    const user = await User.create({
      name,
      username,
      email,
      password
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mendaftarkan pengguna',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate username & password
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password harus diisi'
      });
    }

    // Check for user
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    // Catat audit login (waktu tercatat di createdAt)
    try {
      // Attach user sementara agar util audit bisa mengambil identitas
      req.user = user;
      await logAudit(req, {
        action: 'login',
        model: 'Auth',
        itemId: user._id?.toString(),
        details: `Login dari IP ${req.ip || '-'}; UA: ${req.headers['user-agent'] || '-'}`,
      });
    } catch (_) {}

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal login',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan data pengguna',
      error: error.message
    });
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // Catat audit logout
    try {
      await logAudit(req, {
        action: 'logout',
        model: 'Auth',
        itemId: req.user?._id?.toString(),
        details: `Logout dari IP ${req.ip || '-'}; UA: ${req.headers['user-agent'] || '-'}`,
      });
    } catch (_) {}

    res.status(200).json({
      success: true,
      message: 'Berhasil logout'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal logout', error: error.message });
  }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  // Return response
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
};