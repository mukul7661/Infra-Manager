const Deployment = require("../models/Deployment");
const { ecsClient, config } = require("../utils/ECSClient");
const { RunTaskCommand } = require("@aws-sdk/client-ecs");

async function sendECSCommand(appName, namespace, repo, chart, deploymentId) {
  console.log(
    "Sending ECS command...",
    appName,
    namespace,
    repo,
    chart,
    deploymentId,
    config
  );

  const command = new RunTaskCommand({
    cluster: config.CLUSTER,
    taskDefinition: config.TASK,
    launchType: "FARGATE",
    count: 1,
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: "ENABLED",
        subnets: [
          "subnet-0bc6af112d003e2aa",
          "subnet-02b6195c72bf57433",
          "subnet-04991e4800e080fb0",
        ],
        securityGroups: ["sg-008be3b60cfbddfd2"],
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: "deploy-image",
          environment: [
            { name: "APP_NAME", value: appName },
            { name: "NAMESPACE", value: namespace },
            { name: "HELM_REPO", value: repo },
            { name: "CHART", value: chart },
            { name: "DEPLOYMENT_ID", value: deploymentId },
          ],
        },
      ],
    },
  });

  await ecsClient.send(command);
}

exports.deployApp = async (req, res) => {
  const { namespace, appName, chart, repo } = req.body;
  const userId = req.user?.id;
  try {
    const deployment = await Deployment.findOne({ appName, namespace });
    if (deployment) {
      return res.status(400).json({ error: "Deployment already exists" });
    }

    const newDeployment = new Deployment({
      namespace,
      appName,
      status: "IN_PROGRESS",
      userId,
    });
    await newDeployment.save();

    console.log("Deployment created:", newDeployment, chart);

    await sendECSCommand(appName, namespace, repo, chart, newDeployment?.id);

    res.status(201).json(newDeployment);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.handleDeployError = async (req, res) => {
  const { error, deploymentId } = req.body;

  await Deployment.findByIdAndUpdate(
    { _id: deploymentId },
    {
      status: "INSTALLATION_ERROR",
    }
  );

  res.status(400).json({ error });
};
