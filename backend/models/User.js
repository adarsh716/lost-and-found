const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiration: Date,
  address: { type: String },
  phoneNumber: { type: String },
  usernameLastUpdated: { type: Date, default: null },
  friends: [
    {
      friendId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      friendName: { type: String}
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
