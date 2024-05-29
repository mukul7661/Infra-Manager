const express = require("express");
const {
  deployApp,
  handleDeployError,
} = require("../controllers/deployController");
const router = express.Router();

router.post("/", deployApp);
router.post("/error", handleDeployError);

module.exports = router;
