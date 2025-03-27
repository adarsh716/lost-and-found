const mongoose = require('mongoose');

const privateMessageSchema = new mongoose.Schema({
    text: { type: String, required: true },
    image: { type: String },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderUsername: { type: String},
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    
  },{timestamps:true});
  
module.exports = mongoose.model('PrivateMessage', privateMessageSchema);
  