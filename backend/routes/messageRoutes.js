const express = require('express');
const messageController = require('../controllers/messageController');
const privateMessageController=require("../controllers/privateChatController");
const {
  createCommunityMessage,
  getCommunityMessages,
  getRecentCommunityMessages,
  deleteCommunityMessage
} = require('../controllers/messageController');
const router = express.Router();

router.post('/community', messageController.createCommunityMessage);
router.get('/community', messageController.getCommunityMessages); 

router.post('/private', privateMessageController.sendMessage); 
router.get('/private', privateMessageController.getMessages);



// Middleware for authentication (add your auth middleware here)
// const authenticateToken = require('../middleware/auth');

// Get all community messages (with pagination)
router.get('/', getCommunityMessages);

// Get recent messages (for syncing)
router.get('/recent', getRecentCommunityMessages);

// Create a new community message
router.post('/', createCommunityMessage); // Add authenticateToken middleware if needed

// Delete a message
router.delete('/:messageId', deleteCommunityMessage); // Add authenticateToken middleware if needed

module.exports = router;