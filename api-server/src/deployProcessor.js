const amqp = require("amqplib");
const { helmInstall } = require("./utils/helmClient");
const { createNamespace } = require("./utils/k8sService");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const QUEUE_NAME = "deployments";

const processMessage = async (msg) => {
  if (msg) {
    const messageContent = msg.content.toString();
    const { namespace, appName, chart } = JSON.parse(messageContent);

    try {
      await createNamespace(namespace);
      await helmInstall(appName, namespace, chart);
    } catch (error) {
      console.error("Deployment error:", error);
    }
  }
};

const consumeQueue = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    channel.prefetch(1);
    channel.consume(QUEUE_NAME, async (msg) => {
      await processMessage(msg);
      if (msg) {
        channel.ack(msg);
      }
    });
    console.log("Waiting for messages...");
  } catch (error) {
    console.error("Error in consumeQueue:", error);
  }
};

const start = async () => {
  await connectDB();
  await consumeQueue();
};

start();
