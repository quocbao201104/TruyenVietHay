// backend/controllers/badge.controller.js
const LevelBadgeModel  = require("../models/levelBadge.model");
const badgeService     = require("../services/badge.service");
const cloudinary       = require("cloudinary").v2;
const multer           = require("multer");
const sharp            = require("sharp");

// ── Multer: memory storage (no temp file on disk) ─────────────────────────────
const storage = multer.memoryStorage();
exports.uploadMiddleware = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Chỉ chấp nhận file ảnh"), false);
    }
    cb(null, true);
  },
}).single("icon");

/**
 * GET /api/badges
 * Returns all active badges (sorted by sort_order).
 * Public route — used by the frontend badge legend / admin listing.
 */
exports.getAllBadges = async (req, res) => {
  try {
    const badges = await badgeService.getAllBadges();
    res.json({ success: true, data: badges });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/badges/:id
 * Returns a single badge by ID.
 * Admin only.
 */
exports.getBadgeById = async (req, res) => {
  try {
    const badge = await LevelBadgeModel.getById(req.params.id);
    if (!badge) return res.status(404).json({ success: false, error: "Badge không tồn tại" });
    res.json({ success: true, data: badge });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * POST /api/badges
 * Create a new badge (admin).
 * Body: { min_level_id, max_level_id, badge_name, slug, icon_filename, icon_url, rarity, color, animation_type, sort_order }
 */
exports.createBadge = async (req, res) => {
  try {
    const id = await LevelBadgeModel.create(req.body);
    badgeService.adminInvalidateBadgeCache();
    res.status(201).json({ success: true, data: { id } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/**
 * PATCH /api/badges/:id
 * Partial update of a badge (admin).
 * Supports: icon_url, override_icon_url, override_expires_at, color, animation_type, is_active, etc.
 * Invalidates the badge cache after update.
 */
exports.updateBadge = async (req, res) => {
  try {
    const affected = await LevelBadgeModel.update(req.params.id, req.body);
    if (affected === 0) return res.status(404).json({ success: false, error: "Badge không tồn tại" });
    badgeService.adminInvalidateBadgeCache();
    res.json({ success: true, message: "Cập nhật badge thành công" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/**
 * DELETE /api/badges/:id
 * Soft-delete (is_active = 0). Hard delete is intentionally avoided.
 */
exports.deleteBadge = async (req, res) => {
  try {
    const affected = await LevelBadgeModel.deactivate(req.params.id);
    if (affected === 0) return res.status(404).json({ success: false, error: "Badge không tồn tại" });
    badgeService.adminInvalidateBadgeCache();
    res.json({ success: true, message: "Badge đã bị vô hiệu hóa" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/badges/user/:levelId
 * Returns the badge for a specific level_id.
 * Useful for frontend badge-preview widgets.
 */
exports.getBadgeForLevel = async (req, res) => {
  try {
    const badge = await badgeService.getUserBadge(req.params.levelId);
    if (!badge) return res.status(404).json({ success: false, error: "Không có badge cho cấp độ này" });
    res.json({ success: true, data: badge });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * POST /api/badges/:id/upload-icon
 * Upload a badge image — auto-trim, resize to 64×64, convert to WebP, push to Cloudinary.
 * Uses multer memory storage (no temp file). Requires admin auth.
 */
exports.uploadBadgeIcon = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Không có file ảnh được gửi lên" });
    }

    const badge = await LevelBadgeModel.getById(req.params.id);
    if (!badge) {
      return res.status(404).json({ success: false, error: "Badge không tồn tại" });
    }

    // ── 1. Process with sharp: trim → resize → WebP ───────────────────────────
    const processedBuffer = await sharp(req.file.buffer)
      .trim()                          // xóa viền thừa trong suốt/màu đồng nhất
      .resize(64, 64, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // giữ alpha trong suốt
      })
      .webp({ quality: 90 })           // output WebP, giữ alpha
      .toBuffer();

    // ── 2. Upload buffer to Cloudinary ────────────────────────────────────────
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder:        "truyenviethay/badges",
          public_id:     `badge_${badge.slug}`,
          overwrite:     true,
          resource_type: "image",
          format:        "webp",
        },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(processedBuffer);
    });

    // ── 3. Persist icon_url in DB & invalidate cache ──────────────────────────
    await LevelBadgeModel.update(req.params.id, { icon_url: uploadResult.secure_url });
    badgeService.adminInvalidateBadgeCache();

    res.json({
      success:  true,
      icon_url: uploadResult.secure_url,
      message:  "Upload huy hiệu thành công (64×64, WebP)",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
