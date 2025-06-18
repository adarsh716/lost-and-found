const Message = require("../models/Message");
const cloudinary = require('cloudinary').v2;

exports.createCommunityMessage = async (req, res) => {
  try {
    const { text, userId, username } = req.body;
    let imageUrl = '';

    // Validate required fields
    if (!userId || !username) {
      return res.status(400).json({ 
        message: "Missing required fields: userId and username are required" 
      });
    }

    // Validate that either text or image is provided
    if (!text && (!req.files || !req.files.image)) {
      return res.status(400).json({ 
        message: "Either text or image must be provided" 
      });
    }

    // Handle image upload if present
    if (req.files && req.files.image) {
      const file = req.files.image;
      console.log("File uploaded:", file.name, file.size);

      try {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({ 
            message: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed." 
          });
        }

        // Validate file size (e.g., 10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          return res.status(400).json({ 
            message: "File too large. Maximum size is 10MB." 
          });
        }

        const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
          public_id: `message_${Date.now()}_${userId}`, 
          folder: "community_messages",
          resource_type: "image",
          transformation: [
            { width: 800, height: 600, crop: "limit" }, // Resize large images
            { quality: "auto" }, // Auto quality optimization
            { fetch_format: "auto" } // Auto format optimization
          ]
        });

        imageUrl = uploadResult.secure_url;
        console.log("Uploaded Image URL:", imageUrl);

      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res.status(500).json({ 
          message: "Failed to upload image", 
          error: uploadError.message 
        });
      }
    }

    // Create new message
    const newMessage = new Message({
      text: text || '', // Ensure text is at least an empty string
      image: imageUrl, 
      userId,
      username,
      createdAt: new Date() // Explicitly set timestamp
    });

    const savedMessage = await newMessage.save();
    console.log("Saved Message:", savedMessage._id);

    // **CRITICAL**: Emit the message to all connected clients via Socket.IO
    // This is what enables real-time messaging
    if (req.io) {
      req.io.emit('newCommunityMessage', savedMessage);
      console.log("Message broadcasted to all clients");
    } else {
      console.warn("Socket.IO instance not available on request object");
    }

    // Return the saved message
    res.status(201).json(savedMessage);

  } catch (error) {
    console.error("Error while creating message:", error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      message: "Internal server error while sending message", 
      error: error.message 
    });
  }
};

exports.getCommunityMessages = async (req, res) => {
  try {
    // Add pagination support
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Default to 50 messages
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalMessages = await Message.countDocuments();

    const messages = await Message.find()
      .sort({ createdAt: 1 }) // Oldest first for chat display
      .skip(skip)
      .limit(limit)
      .lean() // Use lean() for better performance
      .exec(); 

    // Add pagination metadata
    const response = {
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasNextPage: page * limit < totalMessages,
        hasPrevPage: page > 1
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ 
      message: "Error fetching messages", 
      error: error.message 
    });
  }
};

// Additional helper function to get recent messages (useful for real-time sync)
exports.getRecentCommunityMessages = async (req, res) => {
  try {
    const { since } = req.query; // Timestamp to get messages since
    
    let query = {};
    if (since) {
      query.createdAt = { $gt: new Date(since) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .limit(100) // Limit to prevent large responses
      .lean()
      .exec();

    res.status(200).json(messages);

  } catch (error) {
    console.error("Error fetching recent messages:", error);
    res.status(500).json({ 
      message: "Error fetching recent messages", 
      error: error.message 
    });
  }
};

// Function to delete a message (useful for moderation)
exports.deleteCommunityMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body; // User requesting deletion

    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only allow deletion by message owner or admin
    if (message.userId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    // Delete image from cloudinary if exists
    if (message.image) {
      try {
        const publicId = message.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`community_messages/${publicId}`);
      } catch (cloudinaryError) {
        console.warn("Failed to delete image from cloudinary:", cloudinaryError);
      }
    }

    await Message.findByIdAndDelete(messageId);

    // Broadcast deletion to all clients
    if (req.io) {
      req.io.emit('messageDeleted', { messageId });
    }

    res.status(200).json({ message: "Message deleted successfully" });

  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ 
      message: "Error deleting message", 
      error: error.message 
    });
  }
};