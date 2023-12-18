
const express = require("express");
const router = express.Router();
const { addNewProject, getAllProjects, deletedProjectById, updateExistProject } = require("../controller/project");


// POST /api/project/
router.post('/', addNewProject);

// GET /api/project/:id
router.get('/', getAllProjects);
router.get('/:id', getAllProjects);

// PUT /api/project/:id
router.put('/:id', updateExistProject);

// DELETE /api/project/:id
router.delete('/:id', deletedProjectById);


module.exports = router;
