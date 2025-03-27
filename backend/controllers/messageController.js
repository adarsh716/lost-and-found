const Message = require("../models/Message");
const PrivateMessage = require("../models/PrivateMessage");
const cloudinary = require('cloudinary').v2;

exports.createCommunityMessage = async (req, res) => {
  try {
    const { text, userId, username } = req.body;
    let imageUrl = '';

    if (req.files && req.files.image) {
      const file = req.files.image;
      console.log("File uploaded:", file);

      const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
        public_id: `message_${Date.now()}`,  // Optional: you can set a custom public ID for the image
        folder: "community_messages",        // Optional: upload to a specific folder in Cloudinary
      }).catch((error) => {
        console.log("Cloudinary Upload Error:", error);
        throw new Error("Failed to upload image to Cloudinary");
      });

      // Get the secure URL of the uploaded image
      imageUrl = uploadResult.secure_url;
      console.log("Uploaded Image URL:", imageUrl);

      // Example: You can optimize the image URL for better delivery
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

    // Create a new message with the image URL (or no image if none was uploaded)
    const newMessage = new Message({
      text,
      image: imageUrl, 
      userId,
      username,
    });

    const savedMessage = await newMessage.save();
    console.log("Saved Message:", savedMessage);

    res.status(201).json(savedMessage);
  } catch (error) {
    console.log("Error while creating message:", error);
    res.status(500).json({ message: "Error sending message", error });
  }
};




exports.getCommunityMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: 1 })
      // .populate("replyTo")
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
