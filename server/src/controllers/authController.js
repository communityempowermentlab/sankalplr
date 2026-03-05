const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/helper');
const pool = require('../config/db');
const crypto = require('crypto');
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

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

        if (!username || !password) {
            await logActivity(null, username || 'Unknown', 'Unknown', 'Login', 'Failed', ipAddress, deviceInfo, null);
            return res.status(400).json({ success: false, message: 'Please provide an username and password' });
        }

        // Check for brute-force: 5 failed attempts in the last 15 minutes for this username or IP
        const [recentFails] = await pool.query(
            `SELECT COUNT(*) as fail_count FROM UserActivityLogs 
             WHERE (username = ? OR ip_address = ?) 
             AND action = 'Login' AND status = 'Failed' 
             AND action_time >= NOW() - INTERVAL 15 MINUTE`,
            [username, ipAddress]
        );

        if (recentFails[0].fail_count >= 5) {
            await logActivity(null, username, 'Unknown', 'Login', 'Failed', ipAddress, deviceInfo, null);
            return res.status(429).json({ success: false, message: 'Too many failed login attempts. Account locked for 15 minutes. Please try again later.' });
        }

        const [rows] = await pool.query('SELECT * FROM Users WHERE username = ?', [username]);

        if (rows.length === 0) {
            await logActivity(null, username, 'Unknown', 'Login', 'Failed', ipAddress, deviceInfo, null);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = rows[0];

        if (user.status !== 'Active') {
            await logActivity(user.id, user.username, user.role_type === 1 ? 'Admin' : 'Staff', 'Login', 'Failed', ipAddress, deviceInfo, null);
            return res.status(401).json({ success: false, message: 'Account is inactive. Please contact administrator.' });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            await logActivity(user.id, user.username, user.role_type === 1 ? 'Admin' : 'Staff', 'Login', 'Failed', ipAddress, deviceInfo, null);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Create session ID and JWT token
        const sessionId = crypto.randomUUID();
        const roleString = user.role_type === 1 ? 'Admin' : 'Staff';

        // Pass sessionId to payload (modify generateToken to accept sessionId if you wish, or just pack it here, 
        // but for now we'll rely on the existing generateToken which might not take sessionId. 
        // We'll generate a custom token here to include sessionId for secure logout tracking.)
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                username: user.username,
                role_type: user.role_type,
                session_id: sessionId
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        await logActivity(user.id, user.username, roleString, 'Login', 'Success', ipAddress, deviceInfo, sessionId);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                role_type: user.role_type
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Logout user & record activity
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const sessionId = req.user.session_id; // Added to token payload above

        const [rows] = await pool.query('SELECT * FROM Users WHERE id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        const user = rows[0];
        const roleString = user.role_type === 1 ? 'Admin' : 'Staff';

        // Calculate session duration and close the log session
        if (sessionId) {
            const [logs] = await pool.query('SELECT action_time FROM UserActivityLogs WHERE session_id = ? AND action = "Login" ORDER BY id DESC LIMIT 1', [sessionId]);

            let durationMins = null;
            if (logs.length > 0) {
                const loginTime = new Date(logs[0].action_time);
                durationMins = Math.round((new Date() - loginTime) / 60000);
            }

            await pool.query(
                `INSERT INTO UserActivityLogs 
                (user_id, username, role, action, status, session_id, session_duration_minutes, logout_type) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [user.id, user.username, roleString, 'Logout', 'Success', sessionId, durationMins, 'Manual']
            );
        }

        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Register a new user (for initial setup or admin use)
// @route   POST /api/auth/register
// @access  Private (Admin Only) - Optionally public during dev
const registerUser = async (req, res, next) => {
    try {
        const { name, username, password, role_type } = req.body;

        if (!name || !username || !password) {
            return res.status(400).json({ success: false, message: 'Please add all required fields' });
        }

        // Check if user exists
        const [existing] = await pool.query('SELECT * FROM Users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const rType = role_type ? role_type : 2; // Default to Staff (2)

        const [result] = await pool.query(
            'INSERT INTO Users (name, username, password, role_type) VALUES (?, ?, ?, ?)',
            [name, username, hashedPassword, rType]
        );

        if (result.insertId) {
            res.status(201).json({
                success: true,
                message: 'User created successfully',
                user: { id: result.insertId, name, username, role_type: rType }
            })
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        next(error);
    }
}


// @desc    Update user profile (Name Only)
// @route   PUT /api/auth/profile
// @access  Private (Self)
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, message: 'Name field is required' });
        }

        await pool.query('UPDATE Users SET name = ? WHERE id = ?', [name.trim(), userId]);

        // Re-fetch to return latest data
        const [rows] = await pool.query('SELECT id, name, username, role_type FROM Users WHERE id = ?', [userId]);

        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
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
            name, // new name
            req.user.role_type,
            'Account Activity',
            `Updated profile information`,
            ipAddress
        );
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: rows[0]
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Change Password
// @route   PUT /api/auth/password
// @access  Private (Self)
const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide both current and new passwords' });
        }

        const [rows] = await pool.query('SELECT * FROM Users WHERE id = ?', [userId]);
        const user = rows[0];

        // 1. Check current password matches
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            await logActivity(userId, user.username, user.role_type === 1 ? 'Admin' : 'Staff', 'ChangePassword', 'Failed', ipAddress, deviceInfo, req.user.session_id);
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        // 2. Check strict validation manually on backend
        const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!pwdRegex.test(newPassword)) {
            return res.status(400).json({ success: false, message: 'New password does not meet security requirements' });
        }

        // 3. Check new password is not the same as old
        const isSame = await bcrypt.compare(newPassword, user.password);
        if (isSame) {
            return res.status(400).json({ success: false, message: 'New password cannot be the same as the current password' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.query('UPDATE Users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        await logActivity(userId, user.username, user.role_type === 1 ? 'Admin' : 'Staff', 'ChangePassword', 'Success', ipAddress, deviceInfo, req.user.session_id);

        // Global System Activity Log
        await logSystemActivity(
            req.user.id,
            user.name,
            req.user.role_type,
            'Account Activity',
            `Changed account password`,
            ipAddress
        );

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    loginUser,
    registerUser,
    logoutUser,
    updateProfile,
    changePassword
};
