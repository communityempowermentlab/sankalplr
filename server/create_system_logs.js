const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 8889,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_NAME || 'sankalplr'
        });

        const sql = `
            CREATE TABLE IF NOT EXISTS SystemActivityLogs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                username VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL,
                activity_type VARCHAR(100) NOT NULL,
                description TEXT NOT NULL,
                ip_address VARCHAR(45) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_created_at (created_at),
                INDEX idx_user (user_id)
            );
        `;

        await conn.execute(sql);
        console.log('SystemActivityLogs table created successfully.');

        await conn.end();
    } catch (e) {
        console.error('Database Error:', e.message);
    }
}

run();
