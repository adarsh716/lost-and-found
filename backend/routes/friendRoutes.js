const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendRequestController');

router.post('/send', friendController.sendFriendRequest);
router.get('/requests', friendController.getFriendRequests);
router.put('/accept', friendController.acceptFriendRequest);
router.put('/decline', friendController.declineFriendRequest);
 
module.exports = router;