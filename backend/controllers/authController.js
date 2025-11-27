const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Define permissions for each role
const rolePermissions = {
    Admin: [
        'dashboard', 'customer-list', 'site-list', 'guard-list', 'staff-list',
        'daily-advance', 'equipment-request', 'damage-deposit', 'social-security',
        'scheduler', 'services', 'product', 'settings'
    ],
    Supervisor: ['dashboard', 'site-list', 'scheduler', 'guard-list'],
    HR: ['dashboard', 'guard-list', 'staff-list', 'social-security'],
    User: ['dashboard']
};

// Helper function to get permissions by role
const getPermissionsByRole = (role) => {
    return rolePermissions[role] || rolePermissions.User;
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    const { username, password, firstName, lastName, email, role } = req.body;

    if (!username || !password || !firstName || !lastName) {
        return res.status(400).json({ message: 'Please add all required fields' });
    }

    try {
        // Check if user exists
        const userExists = await User.findOne({ username });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            username,
            password: hashedPassword,
            firstName,
            lastName,
            email,
            role: role || 'User',
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                permissions: getPermissionsByRole(user.role),
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check for user
        const user = await User.findOne({ username }).select('+password');

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                permissions: getPermissionsByRole(user.role),
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = {
    register,
    login,
    getMe,
};
