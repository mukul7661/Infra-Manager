const AWS = require("aws-sdk");
const { KubeConfig, CoreV1Api } = require("@kubernetes/client-node");

// Set the region for AWS SDK
AWS.config.update({ region: "ap-south-1" }); // Replace 'ap-south-1' with your EKS cluster region

// Create an EKS object
const eks = new AWS.EKS();

// Define parameters for describing the cluster
const params = {
  name: "scoutflo-deploy-cluster", // Replace 'scoutflo-deploy-cluster' with your EKS cluster name
};

// Describe the cluster
eks.describeCluster(params, (err, data) => {
  if (err) {
    console.error("Error describing cluster", err);
  } else {
    console.log("Cluster details:", data.cluster);
    if (data.cluster && data.cluster.name) {
      // Extract necessary information for Kubernetes configuration
      const clusterEndpoint = data.cluster.endpoint;
      const clusterCertificateAuthorityData =
        data.cluster.certificateAuthority.data;
      const clusterName = data.cluster.name;

      // Create Kubernetes configuration
      const kubeConfig = new KubeConfig();
      kubeConfig.loadFromCluster(data.cluster);

      // Now you can use this kubeConfig to make Kubernetes API requests
      const k8sApi = kubeConfig.makeApiClient(CoreV1Api);
      // For example:
      k8sApi
        .listPodForAllNamespaces()
        .then((res) => {
          console.log("Pods:", res.body);
        })
        .catch((err) => {
          console.error("Error:", err);
        });
    } else {
      console.error(
        "Cluster name is missing or undefined in the response:",
        data.cluster
      );
    }
  }
});
