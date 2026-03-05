const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function createAdmin() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const username = 'admin@sankalplr.com';
        const rawPassword = 'admin'; // You can log in with this

        const [existing] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);

        if (existing.length > 0) {
            await connection.execute(
                `UPDATE users SET password = ?, role_type = ? WHERE username = ?`,
                [hashedPassword, 1, username]
            );
        } else {
            await connection.execute(
                `INSERT INTO users (name, username, password, role_type, status) 
                 VALUES (?, ?, ?, ?, ?)`,
                ['Super Admin', username, hashedPassword, 1, 'Active']
            );
        }

        console.log("Login: admin@sankalplr.com | Password: admin");

        await connection.end();
    } catch (error) {
        console.error("Database connection or insertion failed:", error);
    }
}

createAdmin();
