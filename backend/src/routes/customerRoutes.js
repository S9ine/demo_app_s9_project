const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// GET /api/customers -> สำหรับดึงข้อมูลลูกค้าทั้งหมด
router.get('/', customerController.getAllCustomers);

// เราจะเพิ่ม endpoint อื่นๆ (POST, PUT, DELETE) ที่นี่ในอนาคต

module.exports = router;