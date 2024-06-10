const { ECSClient } = require("@aws-sdk/client-ecs");
require("dotenv").config();

const ecsClient = new ECSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const config = {
  CLUSTER: "scoutflo-deploy-cluster",
  TASK: "deploy-task-ec2",
};

module.exports = { ecsClient, config };
