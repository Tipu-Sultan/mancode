const Log = require("../models/info");


async function saveUserLogs(req, res) {

    try {
        const ip = req.ip;
        const deviceInfo = req.headers['user-agent']; 
        const browser = req.headers['user-agent']; 
        const timing = new Date();

        const existingLog = await Log.findOne({ ip });

        if (existingLog) {
            existingLog.timing = timing;
            await existingLog.save();
            res.status(200).json({ message: 'Log updated successfully' });
        } else {
            const logEntry = new Log({ ip, deviceInfo, timing, browser });
            await logEntry.save();
            res.status(201).json({ message: 'Log saved successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


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
    saveUserLogs
}