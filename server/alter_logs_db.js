const mysql = require('mysql2/promise');
async function run() {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            port: 8889,
            user: 'root',
            password: 'root',
            database: 'sankalplr'
        });

        await conn.execute("ALTER TABLE UserActivityLogs MODIFY COLUMN action ENUM('Login', 'Logout', 'CreateUser', 'UpdateUser', 'DeleteUser') NOT NULL");
        console.log('UserActivityLogs action column altered successfully.');

        await conn.end();
    } catch (e) {
        console.error('Error:', e.message);
    }
}
run();
