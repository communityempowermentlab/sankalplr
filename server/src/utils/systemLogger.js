const pool = require('../config/db');

/**
 * Logs a system-level activity securely into SystemActivityLogs.
 * @param {Number} userId - ID of the user performing the action (can be null for system tasks)
 * @param {String} username - Username or Name
 * @param {Number|String} roleType - 1 for Admin, 2 for Staff, or string ('Admin'/'Staff')
 * @param {String} activityType - Short categorization (e.g. 'Account', 'Patient', 'User Management')
 * @param {String} description - Full detail string (e.g. "John Doe (Admin) added a new staff member")
 * @param {String} ipAddress - IP Address (optional)
 */
const logSystemActivity = async (userId, username, roleType, activityType, description, ipAddress = null, caseId = null) => {
    try {
        let role = 'Unknown';
        if (roleType === 1 || String(roleType).toLowerCase() === 'admin') role = 'Admin';
        else if (roleType === 2 || String(roleType).toLowerCase() === 'staff') role = 'Staff';

        await pool.query(
            `INSERT INTO SystemActivityLogs 
            (user_id, username, role, activity_type, description, ip_address, case_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, username, role, activityType, description, ipAddress, caseId]
        );
    } catch (e) {
        console.error('Failed to log system activity:', e);
    }
};

module.exports = { logSystemActivity };
