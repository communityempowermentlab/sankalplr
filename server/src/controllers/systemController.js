const pool = require('../config/db');

// @desc    Get system activity logs
// @route   GET /api/system-activity
// @access  Private (Admin & Staff) (Dashboard view logic controls rendering)
exports.getSystemActivityLogs = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 100;

        // Fetch logs descending ensuring newest are always first
        const [rows] = await pool.query(
            `SELECT id, username, role, activity_type, description, created_at, case_id
             FROM SystemActivityLogs 
             ORDER BY created_at DESC 
             LIMIT ?`,
            [limit]
        );

        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        next(error);
    }
};
