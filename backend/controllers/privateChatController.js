const PrivateMessage = require("../models/PrivateMessage");
const mongoose = require("mongoose");

exports.sendMessage = async (req, res) => {
  console.log(req.body);
  try {
    const { text, image, recipientId,senderId } = req.body;
    
    console.log(senderId);

    if (!text && !image) {
      return res
        .status(400)
        .json({ message: "Message must contain text or an image" });
    }

    const newMessage = new PrivateMessage({
      text,
      senderId,
      recipientId,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { recipientId } = req.params;
    console.log(recipientId);

    const currentUserId = req.body.senderId;

    const messages = await PrivateMessage.find({
      $or: [
        { senderId: currentUserId, recipientId: userId },
        { senderId: userId, recipientId: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    console.log(messages);

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await PrivateMessage.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await PrivateMessage.findByIdAndDelete(messageId);
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
