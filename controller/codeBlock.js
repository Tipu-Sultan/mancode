
const EditorModel = require('../models/editor')

async function createNewCodeBlock(req, res) {
    try {
        // Get data from the request body
        const { title, languages, content } = req.body;

        // Create a new code block
        const newCodeBlock = new EditorModel({
            title,
            languages,
            content,
        });

        // Save the code block to the database
        await newCodeBlock.save();

        // Send a success response
        res.status(201).json({ message: "Code block saved successfully" });
    } catch (error) {
        // Handle errors
        console.error("Error saving code block:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function GetAllCodeBlocks(req, res) {
    try {
        const codeBlocks = await EditorModel.find();
        res.json(codeBlocks);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getCodeBlockByID(req, res) {
    try {
        const codeBlock = await EditorModel.findOne({ _id: req.params.cid });

        if (!codeBlock) {
            return res.status(404).json({ error: "Code block not found" });
        }

        res.json(codeBlock);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function updateCodeBlockById(req, res) {
    const { title, languages, content } = req.body;

    try {
        const updatedCodeBlock = await EditorModel.findByIdAndUpdate(
            req.params.cid,
            { title, languages, content },
            { new: true }
        );

        if (!updatedCodeBlock) {
            return res.status(404).json({ message: "Code block not found" });
        }

        res
            .status(201)
            .json({ message: "Code updated successfully", updatedCodeBlock });
    } catch (error) {
        console.error("Error updating code block:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function deleteCodeBlockById(req, res) {
    try {
        const deletedCodeBlock = await EditorModel.findByIdAndDelete(req.params.id);

        if (!deletedCodeBlock) {
            return res.status(404).json({ message: "Code block not found" });
        }

        res.status(200).json({ message: "Code block deleted successfully" });
    } catch (error) {
        console.error("Error deleting code block:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    createNewCodeBlock,
    GetAllCodeBlocks,
    getCodeBlockByID,
    updateCodeBlockById,
    deleteCodeBlockById
}