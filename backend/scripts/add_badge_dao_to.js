/**
 * scripts/add_badge_dao_to.js
 *
 * Thêm badge "Đạo Tổ" (level 13) vào DB:
 *   1. Xử lý dao-to.jpg bằng sharp → trim → resize 64×64 → WebP
 *   2. Upload lên Cloudinary
 *   3. INSERT INTO level_badges (id = 13)
 *
 * Chạy:
 *   cd backend
 *   node scripts/add_badge_dao_to.js
 */

require("dotenv").config();
const path       = require("path");
const sharp      = require("sharp");
const cloudinary = require("cloudinary").v2;
const db         = require("../config/db");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Badge definition ──────────────────────────────────────────────────────────
const BADGE = {
  id:             13,
  min_level_id:   13,
  max_level_id:   13,
  badge_name:     "Đạo Tổ",
  slug:           "dao-to",
  icon_filename:  "dao-to.png",
  rarity:         "legendary",
  color:          "#FF6A00",   // cam lửa đặc trưng
  animation_type: "flame",
  is_active:      1,
  sort_order:     13,
};

const FILE_PATH         = path.resolve(__dirname, "../public/badge", BADGE.icon_filename);
const CLOUDINARY_FOLDER = "truyenviethay/badges";

// ── Helpers ───────────────────────────────────────────────────────────────────
function uploadBuffer(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:        CLOUDINARY_FOLDER,
        public_id:     publicId,
        overwrite:     true,
        resource_type: "image",
        format:        "webp",
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  try {
    console.log(`🏮 Thêm badge "${BADGE.badge_name}" (level ${BADGE.min_level_id})...\n`);

    // 1. Sharp: trim → resize 64×64 → WebP
    process.stdout.write("🖼️  Xử lý ảnh (trim → 64×64 → WebP)... ");
    const buffer = await sharp(FILE_PATH)
      .trim()
      .resize(64, 64, {
        fit:        "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: 90 })
      .toBuffer();
    console.log("✓");

    // 2. Upload lên Cloudinary
    process.stdout.write("☁️  Upload Cloudinary... ");
    const result = await uploadBuffer(buffer, `badge_${BADGE.slug}`);
    const iconUrl = result.secure_url;
    console.log("✓");
    console.log(`   📎 ${iconUrl}\n`);

    // 3. INSERT (hoặc UPDATE nếu đã tồn tại)
    process.stdout.write("💾 Ghi vào DB... ");
    await db.query(
      `INSERT INTO level_badges
         (id, min_level_id, max_level_id, badge_name, slug, icon_filename,
          icon_url, rarity, color, animation_type, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         min_level_id   = VALUES(min_level_id),
         max_level_id   = VALUES(max_level_id),
         badge_name     = VALUES(badge_name),
         icon_filename  = VALUES(icon_filename),
         icon_url       = VALUES(icon_url),
         rarity         = VALUES(rarity),
         color          = VALUES(color),
         animation_type = VALUES(animation_type),
         is_active      = VALUES(is_active),
         sort_order     = VALUES(sort_order)`,
      [
        BADGE.id,
        BADGE.min_level_id,
        BADGE.max_level_id,
        BADGE.badge_name,
        BADGE.slug,
        BADGE.icon_filename,
        iconUrl,
        BADGE.rarity,
        BADGE.color,
        BADGE.animation_type,
        BADGE.is_active,
        BADGE.sort_order,
      ]
    );
    console.log("✓\n");

    console.log("─".repeat(55));
    console.log(`✅ Badge "${BADGE.badge_name}" đã được thêm thành công!`);
    console.log(`   ID          : ${BADGE.id}`);
    console.log(`   Level       : ${BADGE.min_level_id}`);
    console.log(`   Rarity      : ${BADGE.rarity}`);
    console.log(`   Animation   : ${BADGE.animation_type}`);
    console.log(`   icon_url    : ${iconUrl}`);
    console.log("─".repeat(55));

  } catch (err) {
    console.error("\n❌ Lỗi:", err.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
