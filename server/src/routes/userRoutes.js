const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, getUserActivityLogs } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Role middleware to restrict access to Admins (role_type = 1)
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role_type === 1) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized, admin access required' });
    }
};

// All user routes are protected and restricted to admins
router.use(protect);
router.use(adminOnly);

router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id')
    .put(updateUser)
    .delete(deleteUser);

router.route('/:id/activity')
    .get(getUserActivityLogs);

module.exports = router;
