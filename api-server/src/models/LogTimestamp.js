const mongoose = require("mongoose");

const LogTimestampSchema = new mongoose.Schema({
  namespace: String,
  podName: String,
  containerName: String,
  lastFetchedTimestamp: Date,
});

module.exports = mongoose.model("LogTimestamp", LogTimestampSchema);
