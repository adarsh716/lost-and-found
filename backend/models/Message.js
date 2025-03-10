const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  text: { type: String },
  image: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null }, 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
