const express = require("express");
const router = express.Router();
const rewardController = require("../controllers/reward.controller");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { validateRewardCreation } = require("../validators/reward.validator");

router.get("/", authenticateToken, rewardController.getAllRewards);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  validateRewardCreation,
  rewardController.createReward
);

module.exports = router;
