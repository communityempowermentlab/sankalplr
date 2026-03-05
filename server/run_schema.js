const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || 'root',
    database: process.env.DB_NAME || 'sankalplr',
    port: 8889,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});

async function runSchema() {
    try {
        const schema = fs.readFileSync('../sankalplr_schema.sql', 'utf8');
        console.log("Executing schema...");
        await pool.query(schema);
        console.log("Schema executed successfully.");
    } catch (e) {
        console.error("Error executing schema:", e);
    }
    process.exit(0);
}

runSchema();
