const { helmInstall } = require("./utils/helmClient");
const { createNamespace } = require("./utils/k8sService");

const startProcess = async () => {
  console.log("Starting process...");
  const namespace = process.env.NAMESPACE;
  const appName = process.env.APP_NAME;
  const chart = process.env.CHART;
  const deploymentId = process.env.DEPLOYMENT_ID;

  try {
    await createNamespace(namespace);
    await helmInstall(appName, namespace, chart);
  } catch (error) {
    console.log("Deployment error:", error);
    // await fetch("http://localhost:5000/deploy/error", {
    //   method: "POST",

    //   body: JSON.stringify({
    //     deploymentId,
    //   }),
    // });
  }

  process.exit(0);
};

startProcess();
