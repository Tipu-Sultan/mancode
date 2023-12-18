const Videos = require('../models/video')

async function getAllVideos(req, res) {
    try {
        const videos = await Videos.find();
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function deleteVideoFromAdmin(req, res) {
    try {
        const deletedCodeBlock = await Videos.findByIdAndDelete(req.params.videoId);

        if (!deletedCodeBlock) {
            return res.status(404).json({ message: "Video not found" });
        }

        res.status(200).json({ message: "Video deleted successfully" });
    } catch (error) {
        console.error("Error deleting code block:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    getAllVideos,
    deleteVideoFromAdmin
}