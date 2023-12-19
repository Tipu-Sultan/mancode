const express = require("express");
const { getUsersLogs, deleteUserLog, saveUserLogs } = require("../controller/logs");
const router = express.Router();
// API endpoint to get user logs
router.route('/')
.get(getUsersLogs)
router.delete('/:logId', deleteUserLog);



module.exports = router;
