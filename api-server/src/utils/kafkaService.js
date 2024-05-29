import { Kafka, Consumer, EachMessagePayload, EachBatchPayload } from "kafkajs";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import Log from "../models/Log";

let isInitialized = false;

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

const consumer = kafka.consumer({
  groupId: "scoutflo-deploy-server",
});

async function initKafkaConsumer() {
  try {
    if (isInitialized) {
      console.log("Kafka consumer already initialized.");
      return;
    }

    await consumer.connect();
    await this.consumer.subscribe({
      topics: ["deploy-logs", "deploy-logs-for-frontend"],
      fromBeginning: true,
    });

    await consumer.run({
      eachBatch: handleEachBatch,
    });

    isInitialized = true;
  } catch (err) {
    console.log("Error initializing Kafka consumer: ", err);
  }
}

async function handleEachBatch({
  batch,
  heartbeat,
  commitOffsetsIfNecessary,
  resolveOffset,
}) {
  try {
    const messages = batch.messages;
    console.log(`Received ${messages.length} messages..`);
    for (const message of messages) {
      if (!message.value) continue;
      const stringMessage = message.value.toString();
      const { log, deploymentId } = JSON.parse(stringMessage);
      console.log({ log, deploymentId });
      try {
        await Log.create({ log, deploymentId });

        resolveOffset(message.offset);
        // await commitOffsetsIfNecessary(message.offset);
        await heartbeat();
      } catch (err) {
        console.log(err);
      }
    }
  } catch (error) {
    console.log("Error handling batch:", error);
  }
}

module.exports = { initKafkaConsumer };
