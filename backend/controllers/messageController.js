const Message = require("../models/Message");
const PrivateMessage = require("../models/PrivateMessage");
const cloudinary = require("cloudinary").v2

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
  try {
      const options = { folder };

      if (height) options.height = height;
      if (quality) options.quality = quality;

      options.resource_type = 'auto';

      console.log('UPLOAD OPTIONS:', options);

      if (!file || !file.tempFilePath) {
          throw new Error('No file provided or invalid file path');
      }

      return await cloudinary.uploader.upload(file.tempFilePath, options);
  } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      throw error; 
  }
};

exports.createCommunityMessage = async (req, res) => {
  try {
      const { text, userId, username, replyTo } = req.body;
      console.log({ text, userId, username, replyTo });

      let imageUrl = '';

      if (req.files && req.files.image) {
          const thumbnail = req.files.image;

          console.log('Thumbnail:', thumbnail);

          const uploadedImage = await exports.uploadImageToCloudinary(
              thumbnail,
              process.env.FOLDER_NAME
          );

          imageUrl = uploadedImage.secure_url || '';
      }

      const newMessage = new Message({
          text,
          image: imageUrl,
          userId,
          username,
          replyTo: replyTo || null,
      });

      // Save message
      const savedMessage = await newMessage.save();

      res.status(201).json(savedMessage);
  } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ message: 'Error sending message', error: error.message });
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
