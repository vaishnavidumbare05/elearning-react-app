const express = require('express');
const router = express.Router();

// POST /api/login route
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Your authentication logic here
    if (username === 'user' && password === 'pass') {
        res.status(200).json({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

module.exports = router;
