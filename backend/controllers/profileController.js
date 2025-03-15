const User = require('../models/User'); 


const updateProfile = async (req, res) => {

  const { userId, fullName, address, phoneNumber,email } = req.body; 

  try {

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, address, phoneNumber,email },
      { new: true, runValidators: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};


const getProfileDetails = async (req, res) => {
    const { userId } = req.query;
  
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
  
    try {
      const user = await User.findById(userId).populate('friends'); 
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({
        message: 'User details fetched successfully',
        user,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user details', error: error.message });
    }
  };
  
  const updateUsername = async (req, res) => {
    const { userId, fullName } = req.body;
  
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (user.usernameLastUpdated) {
        const now = new Date();
        const timeSinceLastUpdate = now - user.usernameLastUpdated;
        const daysSinceLastUpdate = timeSinceLastUpdate / (1000 * 60 * 60 * 24); 

        if (daysSinceLastUpdate < 30) {
          return res.status(400).json({ 
            message: `You can only change your username every 30 days. Please try again in ${Math.ceil(30 - daysSinceLastUpdate)} day(s).` 
          });
        }
      }

      user.fullName = fullName;
      user.usernameLastUpdated = new Date(); 
  
      const updatedUser = await user.save();
  
      res.status(200).json({
        message: 'Username updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error updating username', error: error.message });
    }
  };
  
  const getUserProfileDetails = async (req, res) => {
    const { userId } = req.query;
  
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
  
    try {
      const user = await User.findById(userId).populate('friends');
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        message: 'User details fetched successfully',
        user,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user details', error: error.message });
    }
  };
  
  

module.exports = {
  updateProfile,
  getProfileDetails,
  updateUsername,
  getUserProfileDetails
};
