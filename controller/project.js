const Project = require("../models/project");

async function addNewProject(req, res) {
    const { project_name, link, banner, tools } = req.body;

    try {
        // Add a new project
        const newProject = new Project({ project_name, link, banner, tools });
        await newProject.save();

        return res.status(200).json({ message: 'Project added successfully', newProject });
    } catch (error) {
        console.error('Error adding or updating project:', error);
        res.status(500).json({ error: 'Project not added or updated' });
    }
}

async function getAllProjects(req, res) {
    const { id } = req.params
    if (!id) {
        try {
            const projectData = await Project.find();
            res.json(projectData); // Send the project data as JSON response
        } catch (error) {
            console.error('Error fetching project data:', error);
            res.status(500).json({ error: 'Internal Server Error' }); // Send an error response if there's an issue
        }
    } else {
        try {
            const projectId = req.params.id;
            const project = await Project.findById(projectId);

            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            res.json(project);
        } catch (error) {
            console.error('Error fetching project by ID:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

async function updateExistProject(req, res) {
    const { id } = req.params;
    const { project_name, link, banner, tools } = req.body;

    try {
        // Update existing project
        const updatedProject = await Project.findByIdAndUpdate(
            id,
            { project_name, link, banner, tools },
            { new: true } // Set to true to return the updated project
        );

        if (!updatedProject) {
            return res.status(404).json({ error: 'Project not found' });
        }

        return res.status(200).json({ message: 'Project updated successfully', updatedProject });

    } catch (error) {
        console.error('Error adding or updating project:', error);
        res.status(500).json({ error: 'Project not added or updated' });
    }
}

async function deletedProjectById(req, res) {
    try {
        const deletedProject = await Project.findByIdAndDelete(req.params.id);

        if (!deletedProject) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting Project:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    addNewProject,
    getAllProjects,
    updateExistProject,
    deletedProjectById,
}