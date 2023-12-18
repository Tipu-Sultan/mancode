const mongoose = require("mongoose");
//start schema for database
const UserSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    default: ''
  },
  token: {
    type: String,
    default: ''
  },
  access: {
    type: String,
    default: 'a'
  },
  status: {
    type: String,
    default: 'inactive'
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserData = new mongoose.model("User", UserSchema);
module.exports = UserData;
