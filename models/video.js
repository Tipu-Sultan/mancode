const mongoose = require('mongoose');

// Define the comment schema
const CommentSchema = new mongoose.Schema(
  {
    user: {
      type: String, // Assuming a simple username for now
      required: true,
      default:"Tipu"
    },
    full_name: {
      type: String, // Assuming a simple username for now
      required: true,
      default:"Tipu"
    },
    text: {
      type: String,
      required: true,
    },
    replies: [
      {
        user: {
          type: String,
          required: true,
          default:"Tipu"
        },
        full_name: {
          type: String, // Assuming a simple username for now
          required: true,
          default:"Tipu"
        },
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        }
      },
    ],
  },
  { timestamps: true }
);

// Define the video schema
const VideoSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  description: String,
  title: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  dislikes: {
    type: Number,
    default: 0,
  },
  comments: [CommentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Video = mongoose.model('Video', VideoSchema);

module.exports = Video;
