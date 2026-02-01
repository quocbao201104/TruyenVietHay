const express = require("express");
const router = express.Router();
const userRewardController = require("../controllers/userReward.controller");
const { authenticateToken } = require("../middleware/auth");

// 1. Get User Rewards
router.get("/:userId", authenticateToken, userRewardController.getUserRewards);

// 2. Buy Reward (Spend Spirit Stones)
router.post("/buy", authenticateToken, userRewardController.buyReward);

// 3. Claim Milestone/Level Reward (Free if eligible)
router.post("/milestone", authenticateToken, userRewardController.claimMilestone);

// 4. Claim/Activate an Instance (Already owned/unlocked)
router.post(
  "/:userRewardId/claim",
  authenticateToken,
  userRewardController.claimRewardInstance
);

// 5. Use/Consume Item
router.post(
  "/:userRewardId/use",
  authenticateToken,
  userRewardController.useReward
);

module.exports = router;
