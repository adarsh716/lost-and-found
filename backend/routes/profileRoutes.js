const express = require('express');
const { updateProfile, getProfileDetails, updateUsername, getUserProfileDetails } = require('../controllers/profileController');
const router = express.Router();

router.put('/', updateProfile);
router.put('/change-username',updateUsername );
router.get('/', getProfileDetails);
router.get('/public', getUserProfileDetails);

module.exports = router;
