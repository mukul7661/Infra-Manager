const express = require("express");
const {
  getDeployments,
  getAppLogs,
  deleteApp,
  getDeploymentsById,
} = require("../controllers/appsController");
const router = express.Router();

router.get("/", getDeployments);
router.get("/:id", getDeploymentsById);
router.get("/:id/logs", getAppLogs);
router.delete("/:id", deleteApp);

module.exports = router;
