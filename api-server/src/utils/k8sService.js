const { k8sApi } = require("./k8sClient");

const createNamespace = async (namespace) => {
  try {
    await k8sApi.createNamespace({
      metadata: { name: namespace },
    });
  } catch (error) {
    if (
      error.response &&
      error.response.body &&
      error.response.body.reason === "AlreadyExists"
    ) {
      console.log(`Namespace ${namespace} already exists`);
    } else {
      throw new Error(`Namespace creation error: ${error.message}`);
    }
  }
};

const getPodNames = async (namespace) => {
  const pods = await k8sApi.listNamespacedPod(namespace);
  return pods.body.items.map((pod) => pod.metadata.name);
};

module.exports = { createNamespace, getPodNames };
