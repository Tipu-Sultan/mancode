const Video = require("../models/video");
const {storage} = require('../services/cloudStorage')

const bucket = storage.bucket('edunify');
async function uploadVideo(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded." });
        }

        // Extract title and description from the request body
        const { title, description } = req.body;

        // Save file details to MongoDB
        const newFile = new Video({
            title,
            description,
            filename: req.file.originalname, // Use originalname instead of filename
            mimetype: req.file.mimetype,
            originalname: req.file.originalname,
            size: req.file.size,
        });

        await newFile.save();

        // Upload the file to Google Cloud Storage
        const blob = bucket.file(req.file.originalname);
        const blobStream = blob.createWriteStream();

        blobStream.on('error', (err) => {
            console.error('Error uploading file to Google Cloud Storage:', err);
            res.status(500).json({ success: false, error: 'Error uploading file to Google Cloud Storage.' });
        });

        blobStream.on('finish', () => {
            res.status(201).json({
                success: true,
                message: 'File & Details added successfully',
            });
        });

        blobStream.end(req.file.buffer);
    } catch (err) {
        console.error("Error saving file details to MongoDB:", err);
        return res.status(500).json({ message: "Error saving file details to MongoDB." });
    }
}


module.exports = {
    uploadVideo,
}
