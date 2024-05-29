const { k8sApi } = require("./k8sClient");
const Log = require("../models/Log");
const LogTimestamp = require("../models/LogTimestamp");
const Deployment = require("../models/Deployment");
const { Kafka } = require("kafkajs");
const fs = require("fs");
const path = require("path");

const kafka = new Kafka({
  clientId: `scoutflo-deploy-server`,
  brokers: [`${process.env.KAFKA_BROKER}`],
  ssl: {
    ca: [fs.readFileSync(path.join(__dirname, "../kafka.pem"), "utf-8")],
  },
  sasl: {
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
    mechanism: "plain",
  },
});

const producer = kafka.producer();

const fetchLogs = async (namespace, podName, containerName, sinceSeconds) => {
  const options = sinceSeconds ? { sinceSeconds } : {};
  try {
    const logs = await k8sApi.readNamespacedPodLog(
      podName,
      namespace,
      containerName,
      false,
      undefined,
      undefined,
      undefined,
      false,
      options.sinceSeconds,
      undefined,
      false
    );
    return logs.body;
  } catch (error) {
    console.error(
      `Error fetching logs: ${error.body ? error.body.message : error.message}`
    );
    return null;
  }
};

const saveLogs = async (namespace, podName, containerName, logs) => {
  const logEntries = logs.split("\n").map((logLine) => {
    const logType = logLine.toLowerCase().includes("error")
      ? "Error"
      : "Success";
    return {
      namespace,
      podName,
      containerName,
      logType,
      message: logLine,
      timestamp: new Date(),
    };
  });

  await Log.insertMany(logEntries);
};

const aggregateLogs = async () => {
  const deployments = await Deployment.find({});

  try {
    await Promise.all(
      deployments.map(async (deployment) => {
        const { namespace } = deployment;
        const pods = await k8sApi.listNamespacedPod(namespace);
        await Promise.all(
          pods.body.items.map(async (pod) => {
            const podName = pod.metadata.name;
            await Promise.all(
              pod.spec.containers.map(async (container) => {
                const containerName = container.name;
                let logTimestamp = await LogTimestamp.findOne({
                  namespace,
                  podName,
                  containerName,
                });
                const sinceSeconds = logTimestamp
                  ? Math.floor(
                      (Date.now() -
                        new Date(logTimestamp.lastFetchedTimestamp).getTime()) /
                        1000
                    )
                  : null;
                const logs = await fetchLogs(
                  namespace,
                  podName,
                  containerName,
                  sinceSeconds
                );
                if (logs) {
                  // await saveLogs(namespace, podName, containerName, logs);
                  await producer.send({
                    topic: `deploy-logs`,
                    messages: [
                      {
                        key: "log",
                        value: JSON.stringify({
                          deploymentId: deployment._id,
                          logs,
                        }),
                      },
                    ],
                  });

                  await producer.send({
                    topic: `deploy-logs-for-frontend`,
                    messages: [
                      {
                        key: "log",
                        value: JSON.stringify({
                          namespace,
                          podName,
                          containerName,
                          logs,
                        }),
                      },
                    ],
                  });
                  const newTimestamp = new Date();
                  if (logTimestamp) {
                    logTimestamp.lastFetchedTimestamp = newTimestamp;
                  } else {
                    logTimestamp = new LogTimestamp({
                      namespace,
                      podName,
                      containerName,
                      lastFetchedTimestamp: newTimestamp,
                    });
                  }
                  await logTimestamp.save();
                }
              })
            );
          })
        );
      })
    );
  } catch (error) {
    console.error(`Error aggregating logs: ${error.message}`);
  }
};

module.exports = { aggregateLogs };
