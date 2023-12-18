const mongoose = require("mongoose");

const editorSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  title:{ 
    type: String,
    required: true 
  },
  languages:{
    type: String,
    required: true
   },
   views:{
    type: Number,
    default:0,
   },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const EditorModel = mongoose.model("Editor", editorSchema);

module.exports = EditorModel;
