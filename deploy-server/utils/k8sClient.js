const k8s = require("@kubernetes/client-node");
const os = require("os");
const path = require("path");

let k8sApi;

let kc = new k8s.KubeConfig();
let configFile = path.join(os.homedir(), ".kube", "config");
try {
  kc.loadFromFile(configFile);
  k8sApi = kc.makeApiClient(k8s.CoreV1Api);
} catch (e) {
  console.error("Error reading " + configFile + ": " + e.message);
  throw e;
}

module.exports = { k8sApi, k8s };
