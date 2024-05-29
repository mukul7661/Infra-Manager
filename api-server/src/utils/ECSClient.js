import { ECSClient, CreateClusterCommand } from "@aws-sdk/client-ecs";

const ecsClient = new ECSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const config = {
  CLUSTER: "scoutflo-deploy-cluster",
  TASK: "scoutflo-deploy-task",
};

async function createCluster() {
  const command = new CreateClusterCommand({
    clusterName: this.config.CLUSTER,
  });
  await this.ecsClient.send(command);
}

modile.exports = { ecsClient, config, createCluster };
