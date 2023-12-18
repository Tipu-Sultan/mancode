const mongoose = require('mongoose');
// Define a Mongoose schema for URLs
const urlSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortUrl: { type: String, required: true, unique: true },
});

// Create a Mongoose model based on the schema
const Url = mongoose.model('Url', urlSchema);
module.exports = Url