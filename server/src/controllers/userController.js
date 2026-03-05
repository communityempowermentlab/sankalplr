const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { logSystemActivity } = require('../utils/systemLogger');

// Helper to log user activity
const logActivity = async (userId, username, role, action, status, ipAddress, deviceInfo, sessionId) => {
    try {
        await pool.query(
            `INSERT INTO UserActivityLogs 
            (user_id, username, role, action, status, ip_address, device_info, session_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, username, role, action, status, ipAddress, deviceInfo, sessionId]
        );
    } catch (e) {
        console.error('Failed to log activity:', e);
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
    try {
        // Return users with their related login and records count history
        const query = `
            SELECT 
                u.id, u.name, u.username, u.role_type, u.status, u.created_at,
                (SELECT action_time FROM UserActivityLogs WHERE user_id = u.id AND action = 'Login' ORDER BY action_time DESC LIMIT 1) as last_login,
                (SELECT COUNT(*) FROM PatientRecords WHERE created_by = u.id) as total_records
            FROM Users u 
            ORDER BY u.created_at DESC
        `;
        const [rows] = await pool.query(query);
        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new user
// @route   POST /api/users
// @access  Private (Admin)
exports.createUser = async (req, res, next) => {
    try {
        const { name, username, password, role_type, status } = req.body;
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

        if (!name || !username || !password) {
            return res.status(400).json({ success: false, message: 'Please provide name, username, and password' });
        }

        // Check if username already exists
        const [existing] = await pool.query('SELECT id FROM Users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const roleType = role_type || 2; // Default to staff
        const userStatus = status || 'Active'; // Default to Active
        const roleString = roleType === 1 ? 'Admin' : 'Staff';

        const [result] = await pool.query(
            'INSERT INTO Users (name, username, password, role_type, status) VALUES (?, ?, ?, ?, ?)',
            [name, username, hashedPassword, roleType, userStatus]
        );

        const newUserId = result.insertId;

        if (req.user) {
            // Log the creation
            await logActivity(
                req.user.id,
                req.user.username,
                req.user.role_type === 1 ? 'Admin' : 'Staff',
                'CreateUser',
                'Success',
                ipAddress,
                deviceInfo,
                req.user.session_id
            );

            // Global System Activity Log
            await logSystemActivity(
                req.user.id,
                req.user.name || req.user.username,
                req.user.role_type,
                'User Management',
                `Added a new user account for ${name} (${roleString})`,
                ipAddress
            );
        }

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { id: newUserId, name, username, role_type: roleType, status: userStatus }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { name, username, password, role_type, status } = req.body;
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

        // Check if user exists
        const [existing] = await pool.query('SELECT * FROM Users WHERE id = ?', [userId]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // If username is being changed, check for duplicates
        if (username && username !== existing[0].username) {
            const [dupeCheck] = await pool.query('SELECT id FROM Users WHERE username = ?', [username]);
            if (dupeCheck.length > 0) {
                return res.status(400).json({ success: false, message: 'Username already taken by another account' });
            }
        }

        let updateQuery = 'UPDATE Users SET ';
        const updateValues = [];

        if (name) { updateQuery += 'name = ?, '; updateValues.push(name); }
        if (username) { updateQuery += 'username = ?, '; updateValues.push(username); }
        if (role_type) { updateQuery += 'role_type = ?, '; updateValues.push(role_type); }
        if (status) { updateQuery += 'status = ?, '; updateValues.push(status); }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateQuery += 'password = ?, ';
            updateValues.push(hashedPassword);
        }

        // Remove trailing comma and space
        updateQuery = updateQuery.slice(0, -2);
        updateQuery += ' WHERE id = ?';
        updateValues.push(userId);

        await pool.query(updateQuery, updateValues);

        // Fetch updated user
        const [updatedUser] = await pool.query('SELECT id, name, username, role_type, status FROM Users WHERE id = ?', [userId]);

        if (req.user) {
            // Log the update
            await logActivity(
                req.user.id,
                req.user.username,
                req.user.role_type === 1 ? 'Admin' : 'Staff',
                'UpdateUser',
                'Success',
                ipAddress,
                deviceInfo,
                req.user.session_id
            );

            // Global System Activity Log
            await logSystemActivity(
                req.user.id,
                req.user.name || req.user.username,
                req.user.role_type,
                'User Management',
                `Updated details for user ${existing[0].username}`,
                ipAddress
            );
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser[0]
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

        // Check if user exists
        const [existing] = await pool.query('SELECT id, username FROM Users WHERE id = ?', [userId]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (parseInt(userId) === parseInt(req.user.id)) {
            return res.status(403).json({ success: false, message: 'You cannot delete your own account. Ask another admin.' });
        }

        await pool.query('DELETE FROM Users WHERE id = ?', [userId]);

        // Log the deletion
        await logActivity(
            req.user.id,
            req.user.username,
            req.user.role_type === 1 ? 'Admin' : 'Staff',
            'DeleteUser',
            'Success',
            ipAddress,
            deviceInfo,
            req.user.session_id
        );

        // Global System Activity Log
        await logSystemActivity(
            req.user.id,
            req.user.name,
            req.user.role_type,
            'User Management',
            `Deleted user account ID ${userId}`,
            ipAddress
        );

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get user activity logs
// @route   GET /api/users/:id/activity
// @access  Private (Admin)
exports.getUserActivityLogs = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const [rows] = await pool.query(
            `SELECT action, status, action_time, ip_address, device_info, session_duration_minutes, logout_type 
             FROM UserActivityLogs 
             WHERE user_id = ? AND action IN ('Login', 'Logout')
             ORDER BY action_time DESC`,
            [userId]
        );
        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        next(error);
    }
};
