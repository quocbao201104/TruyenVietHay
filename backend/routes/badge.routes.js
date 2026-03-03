// backend/routes/badge.routes.js
const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/badge.controller");
const { authenticateToken } = require("../middleware/auth");

// ── Public ────────────────────────────────────────────────────────────────────
// GET /api/badges — list all active badges
router.get("/", controller.getAllBadges);

// GET /api/badges/level/:levelId — badge for a specific level_id
router.get("/level/:levelId", controller.getBadgeForLevel);

// ── Admin (require auth + admin role) ─────────────────────────────────────────
router.use(authenticateToken);

// GET /api/badges/:id
router.get("/:id", controller.getBadgeById);

// POST /api/badges
router.post("/", controller.createBadge);

// PATCH /api/badges/:id — partial update (icon_url, colors, overrides, etc.)
router.patch("/:id", controller.updateBadge);

// DELETE /api/badges/:id — soft-delete
router.delete("/:id", controller.deleteBadge);

module.exports = router;
