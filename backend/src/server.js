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
        // พิมพ์รายละเอียดของ Error ทั้งหมดออกมา
        console.error(error);
    }
}
// -----------------------------------------

const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);

app.get('/', (req, res) => {
    res.send('Demo App S9 Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    // ---- เรียกใช้ฟังก์ชันทดสอบทันทีที่ Server พร้อม ----
    testDbConnection();
});