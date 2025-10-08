// backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    // 1. ดึง Token จาก Header ที่ชื่อ 'authorization'
    const authHeader = req.headers['authorization'];

    // 2. ตรวจสอบว่ามี Header และ Token ส่งมาหรือไม่
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: 'ไม่ได้รับอนุญาต (ไม่มี Token)' });
    }

    // 3. แยกเอาเฉพาะส่วนของ Token ออกมา (ตัดคำว่า 'Bearer ' ทิ้ง)
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'ไม่ได้รับอนุญาต (Token ไม่ถูกต้อง)' });
    }

    try {
        // 4. ตรวจสอบและถอดรหัส Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 5. (สำคัญ) เก็บข้อมูล user ที่ถอดรหัสได้ไว้ใน req object เพื่อให้ route ที่ตามมาสามารถใช้งานได้
        req.user = decoded;
        
        // 6. อนุญาตให้ request วิ่งต่อไป
        next(); 

    } catch (error) {
        console.error('Token verification error:', error.message);
        if (error.name === 'TokenExpiredError') {
             return res.status(401).json({ message: 'Token หมดอายุ, กรุณาเข้าสู่ระบบใหม่' });
        }
        return res.status(401).json({ message: 'ไม่ได้รับอนุญาต (Token ไม่ถูกต้องหรือหมดอายุ)' });
    }
};

module.exports = {
    verifyToken,
};