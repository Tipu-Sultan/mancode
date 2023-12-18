const express = require("express");
const { getUsersLogs, deleteUserLog } = require("../controller/logs");
const router = express.Router();
// API endpoint to get user logs
router.get('/', getUsersLogs)
router.delete('/:logId', deleteUserLog);



module.exports = router;
