const { k8sApi } = require("./k8sClient");
const Deployment = require("../models/Deployment");
const { io } = require("../socket");

const checkPodHealth = async (namespace, releaseName) => {
  try {
    const response = await k8sApi.listNamespacedPod(
      namespace,
      undefined,
      undefined,
      undefined,
      undefined,
      `app.kubernetes.io/instance=${releaseName}`
    );

    const pods = response.body.items;

    for (const pod of pods) {
      if (pod.status.phase === "Pending") {
        return "IN_PROGRESS";
      }
      if (pod.status.phase === "Failed") {
        return "ERROR";
      }
    }

    return "ACTIVE";
  } catch (error) {
    console.error(`Error checking pod health: ${error.message}`);
    return "ERROR";
  }
};

const updateDeploymentHealth = async () => {
  try {
    const applications = await Deployment.find();
    const checkPromises = applications.map(async (app) => {
      const status = await checkPodHealth(app.namespace, app.appName);
      app.status = status;
      app.lastCheckedAt = new Date();

      if (
        status === "IN_PROGRESS" &&
        new Date() - app.lastUpdatedAt > 5 * 60 * 1000
      ) {
        app.status = "ERROR";
      }
      if (status !== "IN_PROGRESS") {
        app.lastUpdatedAt = new Date();
      }
      io.emit("deploymentStatus", app);
      return app.save();
    });
    await Promise.all(checkPromises);
    console.log("Deployment health statuses updated.");
  } catch (error) {
    console.error(
      `Error updating deployment health statuses: ${error.message}`
    );
  }
};

module.exports = {
  checkPodHealth,
  updateDeploymentHealth,
};
