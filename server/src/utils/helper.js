const jwt = require('jsonwebtoken');

const generateToken = (id, role_type) => {
    return jwt.sign(
        { id, role_type },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

module.exports = { generateToken };
