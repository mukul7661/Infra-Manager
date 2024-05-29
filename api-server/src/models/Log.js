const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  namespace: String,
  podName: String,
  containerName: String,
  logType: { type: String, enum: ["Error", "Success", "Info", "Warning"] },
  message: String,
  timestamp: { type: Date, default: Date.now },
});

logSchema.index({ namespace: 1, podName: 1, containerName: 1, timestamp: -1 });
module.exports = mongoose.model("Log", logSchema);
