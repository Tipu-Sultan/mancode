const File = require("../models/video");
const express = require("express");
const router = express.Router();
const { getAllVideos, deleteVideoFromAdmin } = require("../controller/videos");
const { dislikeVideo, likeVideo, getAllcommentsVideo, commentOnVideo, replyOnCommentVideos, deleteCommentOfVideo, deleteReplyOfCommentsVideo } = require("../controller/comments");


router.get("/", getAllVideos);
router.delete("/:videoId", deleteVideoFromAdmin);

router.route("/comments/:videoId")
  .get(getAllcommentsVideo)
  .post(commentOnVideo)

router.route("/comments/:videoId/:commentId")
  .post(replyOnCommentVideos)
  .delete(deleteCommentOfVideo);

// DELETE route for deleting a reply
router.route("/comments/:videoId/:commentId/:replyId")
  .delete(deleteReplyOfCommentsVideo);

// Like endpoint
router.post("/like/:videoId", likeVideo);

// Dislike endpoint
router.post("/dislike/:videoId", dislikeVideo);
module.exports = router;
