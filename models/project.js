const mongoose = require("mongoose");
//start schema for database
const ProjectSchema = new mongoose.Schema({
  project_name: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  banner: {
    type: String,
    required: true,
  },
  tools: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Project = new mongoose.model("Project", ProjectSchema);
module.exports = Project;
