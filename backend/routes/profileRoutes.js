const express = require('express');
const { updateProfile, getProfileDetails, updateUsername } = require('../controllers/profileController');
const router = express.Router();

router.put('/', updateProfile);
router.put('/change-username',updateUsername );
router.get('/', getProfileDetails);

module.exports = router;
