const CustomerModel = require('../models/customerModel');

const getAllCustomers = async (req, res) => {
    try {
        const customers = await CustomerModel.findAll();
        res.json(customers);
    } catch (error) {
        console.error('Get All Customers Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า' });
    }
};

// เราจะสร้างฟังก์ชัน create, update, delete ในอนาคต

module.exports = {
    getAllCustomers,
};