const db = require('../config/db');

const findByUsername = async (username) => {
    const query = `
        SELECT
            u.id,
            u.username,
            u.password_hash,
            u.first_name,
            u.last_name,
            r.name AS role,
            ARRAY_AGG(p.page_id) AS permissions
        FROM users u
        JOIN roles r ON u.role_id = r.id
        LEFT JOIN permissions p ON r.id = p.role_id
        WHERE u.username = $1
        GROUP BY u.id, r.name;
    `;
    const { rows } = await db.query(query, [username]);
    return rows[0];
};

module.exports = {
    findByUsername,
};