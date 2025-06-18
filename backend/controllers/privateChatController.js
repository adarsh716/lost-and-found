const PrivateMessage = require("../models/privateMessage");
const cloudinary = require('cloudinary').v2;


exports.sendMessage = async (req, res) => {
  try {
    const { text, senderId, recipientId } = req.body;
    let imageUrl = '';

    if (req.files && req.files.image) {
      const file = req.files.image;
      console.log("File uploaded:", file);

      const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
        public_id: `private_message_${Date.now()}`, 
        folder: "private_messages",        
      }).catch((error) => {
        console.log("Cloudinary Upload Error:", error);
        throw new Error("Failed to upload image to Cloudinary");
      });

      imageUrl = uploadResult.secure_url;
      console.log("Uploaded Image URL:", imageUrl);

      const optimizedImageUrl = cloudinary.url(uploadResult.public_id, {
        fetch_format: 'auto',
        quality: 'auto',
      });
      console.log("Optimized Image URL:", optimizedImageUrl);

      const autoCroppedUrl = cloudinary.url(uploadResult.public_id, {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
      });
      console.log("Auto-Cropped Image URL:", autoCroppedUrl);
    }

    if (!text && !imageUrl) {
      return res.status(400).json({ message: "Message must contain text or an image" });
    }

    const newMessage = new PrivateMessage({
      text,
      image: imageUrl, 
      senderId,
      recipientId,
    });

    const savedMessage = await newMessage.save();
    console.log("Saved Message:", savedMessage);
 
    res.status(201).json(savedMessage);
  } catch (error) {
    console.log("Error while sending message:", error);
    res.status(500).json({ message: "Error sending message", error });
  }
};


exports.getMessages = async (req, res) => {
  try {
    const { recipientId, senderId } = req.query;
    console.log('Recipient ID:', recipientId);
    console.log('Sender ID:', senderId);

    if (!recipientId || !senderId) {
      return res.status(400).json({ message: 'Both senderId and recipientId are required.' });
    }

    const messages = await PrivateMessage.find({
      $or: [
        { senderId: senderId, recipientId: recipientId },
        { senderId: recipientId, recipientId: senderId },
      ],
    }).sort({ createdAt: 1 });

    console.log('Messages:', messages);

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
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
