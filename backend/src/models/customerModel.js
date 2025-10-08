const db = require('../config/db');

const findAll = async () => {
    const { rows } = await db.query('SELECT id, code, name, contact FROM customers ORDER BY id ASC');
    return rows;
};

// เราจะสร้างฟังก์ชัน create, update, findById, remove ในอนาคต

module.exports = {
    findAll,
};