const pool = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        let query = `
            SELECT 
                COUNT(*) AS totalCases, 
                MIN(observation_date) AS minDate, 
                MAX(observation_date) AS maxDate 
            FROM PatientRecords
        `;
        let values = [];

        if (req.user && req.user.role_type === 2) {
            query += ` WHERE created_by = ?`;
            values.push(req.user.id);
        }

        const [rows] = await pool.execute(query, values);

        const { totalCases, minDate, maxDate } = rows[0];

        res.status(200).json({ totalCases, minDate, maxDate });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};
