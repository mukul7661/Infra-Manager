const { exec } = require("child_process");

const helmInstall = (helmRepo, releaseName, namespace, chart) => {
  return new Promise((resolve, reject) => {
    console.log(
      `helm repo add ${releaseName} ${helmRepo} && helm install ${releaseName} ${releaseName}/${chart} --namespace ${namespace}`
    );
    exec(
      `helm repo add ${releaseName} ${helmRepo} && helm install ${releaseName} ${releaseName}/${chart} --namespace ${namespace}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`helm install error: ${stderr}`);
          reject(`helm install error: ${stderr}`);
        } else {
          resolve(stdout);
        }
      }
    );
  });
};

const helmDelete = (releaseName, namespace) => {
  return new Promise((resolve, reject) => {
    exec(
      `helm uninstall ${releaseName} --namespace ${namespace}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`helm uninstall error: ${stderr}`);
          reject(`helm uninstall error: ${stderr}`);
        } else {
          resolve(stdout);
        }
      }
    );
  });
};

module.exports = {
  helmInstall,
  helmDelete,
};
