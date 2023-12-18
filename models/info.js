const mongoose = require('mongoose');
const logSchema = new mongoose.Schema({
    ip: String,
    deviceInfo: String,
    timing: Date,
    browser: String,
});

const Log = mongoose.model('Log', logSchema);
module.exports = Log;