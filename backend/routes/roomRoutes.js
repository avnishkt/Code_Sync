const express = require('express');
const { createRoom, verifyRoom } = require('../controllers/roomControllers');

const router = express.Router();

// Route to create a new room
router.post('/create', createRoom);

// Route to verify an existing room by roomId
router.get('/verify/:roomId', verifyRoom);

module.exports = router;
