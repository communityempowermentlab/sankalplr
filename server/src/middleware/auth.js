const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Add user info to req object
            req.user = {
                id: decoded.id,
                name: decoded.name,
                username: decoded.username,
                role_type: decoded.role_type,
                session_id: decoded.session_id
            };

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role_type === 1) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
};

const staffOnly = (req, res, next) => {
    // Assuming both Admin and Staff can act like staff sometimes, but strictly staff is 2.
    // Adjusting logic: Admin (1) OR Staff (2) can access staff endpoints, 
    // but if you want strictly Staff only:
    if (req.user && req.user.role_type === 2) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied. Staff only.' });
    }
};

// A generic middleware where Admin can access everything Staff can, 
// but Staff can't access Admin stuff.
const anyRole = (req, res, next) => {
    if (req.user && (req.user.role_type === 1 || req.user.role_type === 2)) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied. Unauthorized role.' });
    }
};

module.exports = { protect, adminOnly, staffOnly, anyRole };
