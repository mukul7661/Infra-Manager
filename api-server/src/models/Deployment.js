const mongoose = require("mongoose");

const DeploymentSchema = new mongoose.Schema({
  namespace: { type: String, required: true },
  appName: { type: String, required: true },
  deployedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["IN_PROGRESS", "ACTIVE", "ERROR"] },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  lastUpdatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Deployment", DeploymentSchema);
