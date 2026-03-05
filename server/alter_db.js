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

        // Find existing non-empty rows that clash with DATE
        const [rows] = await conn.execute("SELECT id, observation_date FROM PatientRecords WHERE STR_TO_DATE(observation_date, '%Y-%m-%d') IS NULL AND observation_date IS NOT NULL AND observation_date != ''");

        if (rows.length > 0) {
            console.log("Found invalid dates:");
            console.log(rows);
            for (let r of rows) {
                console.log(`Setting ID ${r.id} observation_date to NULL since it's invalid: ${r.observation_date}`);
                await conn.execute("UPDATE PatientRecords SET observation_date = NULL WHERE id = ?", [r.id]);
            }
        }

        // Convert empty strings to NULL before altering
        await conn.execute("UPDATE PatientRecords SET observation_date = NULL WHERE observation_date = ''");

        // Perform alter table
        await conn.execute('ALTER TABLE PatientRecords MODIFY COLUMN observation_date DATE');
        console.log('Alteration Successful. observation_date is now DATE type.');

        await conn.end();
    } catch (e) {
        console.error('Error:', e.message);
    }
}
run();
