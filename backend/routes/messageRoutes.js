const express = require('express');
const messageController = require('../controllers/messageController');
const router = express.Router();

// Community chat routes
router.post('/community', messageController.createCommunityMessage); // Send message to the community
router.get('/community', messageController.getCommunityMessages); // Get all community messages

router.post('/private', messageController.createPrivateMessage); // Send private message between two users
router.get('/private/:recipientId', messageController.getPrivateMessages); // Get private messages between two users

module.exports = router;
