const Videos = require('../models/video')

async function getAllcommentsVideo(req, res) {
    try {
        const { videoId } = req.params;

        const comments = await Videos.find({ videoId }).sort({ date: -1 });

        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

async function commentOnVideo(req, res) {
    const { videoId } = req.params;
    const { user, text, full_name } = req.body;

    try {
        const video = await Videos.findById(videoId);
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        const newComment = {
            user,
            text,
            full_name,
        };
        video.comments.push(newComment);
        await video.save();

        // Include the ID in the response
        const addedComment = video.comments.find(
            (comment) => comment.text === text
        );

        res.status(201).json({
            message: "Comment added successfully",
            comment: { ...addedComment.toObject(), _id: addedComment._id },
        });

        console.log(addedComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

async function replyOnCommentVideos(req, res) {
    const { videoId, commentId } = req.params;
    const { user, text, full_name } = req.body;

    try {
        const video = await Videos.findById(videoId);
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        const comment = video.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const newReply = {
            user,
            text,
            full_name,
        };

        comment.replies.push(newReply);
        await video.save();

        // Retrieve the added reply from the database
        const addedReply = comment.replies[comment.replies.length - 1];

        // Respond with the details of the added reply
        res.status(201).json({
            message: "Reply added successfully",
            reply: addedReply,
            cmtId: commentId,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

async function deleteCommentOfVideo(req, res) {
    const { videoId, commentId } = req.params;
    try {
        const video = await Videos.findById(videoId);
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        const comment = video.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if the comment with the specified commentId exists before attempting to remove it
        const commentIndex = video.comments.findIndex(
            (c) => c._id.toString() === commentId
        );
        if (commentIndex !== -1) {
            video.comments.splice(commentIndex, 1);
            await video.save();
            res.json({ message: "Comment deleted successfully" });
        } else {
            return res.status(404).json({ message: "Comment not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

async function deleteReplyOfCommentsVideo(req, res) {
    const { videoId, commentId, replyId } = req.params;

    try {
        const video = await Videos.findById(videoId);
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        const comment = video.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if the reply with the specified replyId exists before attempting to remove it
        const replyIndex = comment.replies.findIndex(
            (reply) => reply._id.toString() === replyId
        );
        if (replyIndex !== -1) {
            comment.replies.splice(replyIndex, 1);
            await video.save();
            res.json({ message: "Reply deleted successfully" });
        } else {
            return res.status(404).json({ message: "Reply not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

async function likeVideo(req, res) {
    try {
        const video = await Videos.findById(req.params.videoId);

        if (video.likes < 0) {
            // Video is already liked
            video.likes = 0;
        } else {
            // Video is not liked, increment like and decrement dislike
            video.likes += 1;
            if (video.dislikes > 0) {
                video.dislikes = video.dislikes - 1;
            }
        }

        await video.save();
        res.json({ likes: video.likes, dislikes: video.dislikes });
    } catch (error) {
        console.error("Error liking video:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function dislikeVideo(req, res) {
    try {
        const video = await Videos.findById(req.params.videoId);

        if (video.dislikes < 0) {
            // Video is already disliked
            video.dislikes = 0;
        } else {
            // Video is not disliked, increment dislike and decrement like
            video.dislikes += 1;
            if (video.likes > 0) {
                video.likes = video.likes - 1;
            }
        }

        await video.save();
        res.json({ likes: video.likes, dislikes: video.dislikes });
    } catch (error) {
        console.error("Error disliking video:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    getAllcommentsVideo,
    commentOnVideo,
    replyOnCommentVideos,
    deleteCommentOfVideo,
    deleteReplyOfCommentsVideo,
    dislikeVideo,
    likeVideo,
}