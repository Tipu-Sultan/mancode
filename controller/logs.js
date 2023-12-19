const Log = require("../models/info");

async function getUsersLogs(req, res) {
    try {
        const userLogs = await Log.find();
        res.status(200).json(userLogs);
    } catch (error) {
        console.error('Error fetching user logs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function deleteUserLog(req, res) {
    const logId = req.params.logId;

    try {
        const deletedLog = await Log.findByIdAndDelete(logId);

        if (deletedLog) {
            res.status(200).json({ message: 'Log deleted successfully' });
        } else {
            res.status(404).json({ error: 'Log not found' });
        }
    } catch (error) {
        console.error('Error deleting log:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    getUsersLogs,
    deleteUserLog,
}