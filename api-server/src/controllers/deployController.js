const Deployment = require("../models/Deployment");

async function sendECSCommand() {
  const command = new RunTaskCommand({
    cluster: this.config.CLUSTER,
    taskDefinition: this.config.TASK,
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
          name: "scoutflo-deploy-image",
          environment: [
            { name: "NAMESPACE", value: modifiedUrl },
            { name: "APP_NAME", value: project?.subDomain },
            { name: "CHART", value: deployment.id },
            { name: "DEPLOYMENT_ID", value: process.env.KAFKA_ENABLED },
          ],
        },
      ],
    },
  });

  await ecsClient.send(command);
}

exports.deployApp = async (req, res) => {
  const { namespace, appName, chart } = req.body;
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

    // await sendECSCommand();

    res.status(201).json(newDeployment);
  } catch (error) {
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
