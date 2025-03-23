const Message = require("../models/Message");
const PrivateMessage = require("../models/PrivateMessage");


exports.createCommunityMessage = async (req, res) => {
  try {
    const { text, image, userId, username } = req.body;

    const newMessage = new Message({
      text,
      image,
      userId,
      username,
    });

    const savedMessage = await newMessage.save();

    io.emit('newCommunityMessage', savedMessage);

    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error });
  }
};


exports.getCommunityMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: 1 })
      .populate("replyTo")
      .exec();

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error });
  }
};

exports.createPrivateMessage = async (req, res) => {
  try {
    const { text, image, senderId, senderUsername, recipientId } = req.body;

    const newPrivateMessage = new PrivateMessage({
      text,
      image,
      senderId,
      senderUsername,
      recipientId,
    });

    const savedPrivateMessage = await newPrivateMessage.save();

    io.to(recipientId).emit("newPrivateMessage", savedPrivateMessage);

    res.status(201).json(savedPrivateMessage);
  } catch (error) {
    res.status(500).json({ message: "Error sending private message", error });
  }
};

exports.getPrivateMessages = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const { senderId } = req.body;

    const messages = await PrivateMessage.find({
      $or: [
        { senderId, recipientId },
        { senderId: recipientId, recipientId: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching private messages", error });
  }
};
