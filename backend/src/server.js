// backend/src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ---- ส่วนโค้ดสำหรับทดสอบการเชื่อมต่อ DB ----
const db = require('./config/db');

async function testDbConnection() {
    try {
        console.log('Attempting to connect to the database...');
        const time = await db.query('SELECT NOW()');
        console.log('✅ Database connection successful! Current DB time:', time.rows[0].now);
    } catch (error) {
        console.error('❌ Database connection failed!');
        console.error('Error Details:', error.message);
        console.error(error);
    }
}
// -----------------------------------------

// --- 1. Import Middleware และ Routes ---
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const { verifyToken } = require('./middleware/authMiddleware'); // << เพิ่มบรรทัดนี้

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- 2. กำหนด Routes ---
// /api/auth เป็น Public Route ไม่ต้องป้องกัน
app.use('/api/auth', authRoutes); 

// /api/customers เป็น Private Route ต้องผ่านด่านตรวจ verifyToken ก่อน
app.use('/api/customers', verifyToken, customerRoutes); // << แก้ไขบรรทัดนี้

app.get('/', (req, res) => {
    res.send('Demo App S9 Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    testDbConnection();
});