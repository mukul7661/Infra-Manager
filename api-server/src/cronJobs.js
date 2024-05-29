const cron = require("node-cron");
const { aggregateLogs } = require("./utils/logAggregator");
const Log = require("./models/Log");
const { updateDeploymentHealth } = require("./utils/healthCheck");

const healthCheckCron = cron.schedule("*/1 * * * * *", async () => {
  console.log("Running scheduled health check...");
  await updateDeploymentHealth();
});

const logAggregatorCron = cron.schedule("*/1 * * * * *", async () => {
  console.log("Starting log aggregation...");
  await aggregateLogs();
  console.log("Log aggregation completed.");
});

const logEvictorCron = cron.schedule("0 0 * * 0", async () => {
  console.log("Starting log eviction...");
  const result = await Log.deleteMany({
    timestamp: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });
  console.log(`Log eviction completed. ${result.deletedCount} logs deleted.`);
});

module.exports = {
  healthCheckCron,
  logAggregatorCron,
  logEvictorCron,
};
