const User = require('../models/User');
const FriendRequest = require('../models/friendRequestModel');

exports.sendFriendRequest = async (req, res) => {
  try {
    const { receiverId, senderId, message } = req.body;

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (!sender || !receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingRequest = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      status: 'pending',
    });
    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    if (sender.friends.includes(receiverId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    const friendRequest = new FriendRequest({
      sender: senderId,
      receiver: receiverId,
      message: message,
    });
    await friendRequest.save();

    res.status(201).json({ message: 'Friend request sent', friendRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getFriendRequests = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const friendRequests = await FriendRequest.find({ receiver: userId, status: 'pending' })
      .populate('sender', 'fullName email')
      .select('message status')
      .sort({ createdAt: -1 });

    res.status(200).json({ friendRequests });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.acceptFriendRequest = async (req, res) => {
  try {
    const { requestId, userId } = req.body;
    console.log(requestId)
    console.log(userId)
    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      receiver: userId,
      status: 'pending',
    });
    console.log(friendRequest)
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found or already processed' });
    }

    friendRequest.status = 'accepted';
    friendRequest.updatedAt = Date.now();
    await friendRequest.save();

    const receiver = await User.findById(userId).select('_id fullName');
    const sender = await User.findById(friendRequest.sender).select('_id fullName');

    if (!receiver || !sender) {
      return res.status(404).json({ message: 'User or sender not found' });
    }

    await User.findByIdAndUpdate(receiver._id, {
      $addToSet: {
        friends: {
          friendId: sender._id,
          friendName: sender.fullName,
        },
      },
    });

    await User.findByIdAndUpdate(sender._id, {
      $addToSet: {
        friends: {
          friendId: receiver._id,
          friendName: receiver.fullName,
        },
      },
    });

    res.status(200).json({ message: 'Friend request accepted', friendRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.declineFriendRequest = async (req, res) => {
  try {
    const { requestId,userId } = req.body; 
 
    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      receiver: userId,
      status: 'pending',
    });
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found or already processed' });
    }

    // Update friend request status
    friendRequest.status = 'declined';
    friendRequest.updatedAt = Date.now();
    await friendRequest.save();

    res.status(200).json({ message: 'Friend request declined', friendRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};