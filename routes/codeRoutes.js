const express = require("express");
const router = express.Router();

const { createNewCodeBlock, GetAllCodeBlocks, getCodeBlockByID, updateCodeBlockById, deleteCodeBlockById } = require("../controller/codeBlock");
const EditorModel = require("../models/editor");

router.route("/")
  .get(GetAllCodeBlocks)
  .post(createNewCodeBlock);


router.route("/:cid")
  .get(getCodeBlockByID)
  .put(updateCodeBlockById)
  .delete(deleteCodeBlockById);


module.exports = router;
