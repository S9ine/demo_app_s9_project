const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load env
dotenv.config();

// User Schema (same as in models/User.js)
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String },
    role: { type: String, default: 'User' },
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);

async function createUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin@252168', salt);

        // Create user
        const user = await User.create({
            username: 'control',
            password: hashedPassword,
            firstName: 'Control',
            lastName: 'Premium Group',
            email: 'control@premiumgroup.co.th',
            role: 'Admin'
        });

        console.log('✅ User created successfully:');
        console.log({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createUser();
