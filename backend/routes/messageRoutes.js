const express = require('express');
const messageController = require('../controllers/messageController');
const privateMessageController=require("../controllers/privateChatController");
const router = express.Router();

// Community chat routes
router.post('/community', messageController.createCommunityMessage); // Send message to the community
router.get('/community', messageController.getCommunityMessages); // Get all community messages

router.post('/private', privateMessageController.sendMessage); // Send private message between two users
router.get('/private', privateMessageController.getMessages); // Get private messages between two users

module.exports = router;
