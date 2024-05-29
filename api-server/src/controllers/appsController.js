const Deployment = require("../models/Deployment");
const Log = require("../models/Log");
const { helmDelete } = require("../utils/helmClient");
const { getPodNames } = require("../utils/k8sService");

exports.getDeployments = async (req, res) => {
  try {
    const userId = req.user?.id;

    const deployments = await Deployment.find({
      userId,
    });
    res.json(deployments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getDeploymentsById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const deployment = await Deployment.findById({
      userId,
      _id: id,
    });
    res.json(deployment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAppLogs = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const deployment = await Deployment.findById({ _id: id, userId });
    if (!deployment) {
      return res.status(404).json({ message: "Deployment not found" });
    }
    const podNames = await getPodNames(deployment.namespace);

    const logs = await Log.find({
      namespace: deployment.namespace,
      podName: podNames,
    });
    return res.json({ logs });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};

exports.deleteApp = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  try {
    const deployment = await Deployment.findById({ _id: id, userId });
    if (!deployment) {
      return res.status(404).json({ message: "Deployment not found" });
    }
    await helmDelete(deployment.appName, deployment.namespace);
    await Deployment.findByIdAndDelete(id);
    res.json({ message: "Deployment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
