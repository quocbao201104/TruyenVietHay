/**
 * scripts/reupload_badges_webp.js
 *
 * Đọc tất cả badge PNG từ backend/public/badge/,
 * dùng sharp để: trim → resize 64×64 → convert WebP,
 * upload lên Cloudinary rồi cập nhật icon_url trong DB.
 *
 * Chạy:
 *   cd backend
 *   node scripts/reupload_badges_webp.js
 *
 * Yêu cầu:
 *   - .env phải có CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *   - Bảng level_badges đã tồn tại
 *   - File PNG đặt trong backend/public/badge/
 */

require("dotenv").config();
const path      = require("path");
const fs        = require("fs");
const sharp     = require("sharp");
const cloudinary = require("cloudinary").v2;
const db        = require("../config/db");

// ── Cloudinary config ─────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const BADGE_DIR         = path.resolve(__dirname, "../public/badge");
const CLOUDINARY_FOLDER = "truyenviethay/badges";

// ── Helpers ───────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Xử lý ảnh bằng sharp: trim → resize 64×64 → WebP buffer
 */
async function processImage(filePath) {
  return sharp(filePath)
    .trim()                          // Xóa viền thừa trong suốt / màu đồng nhất
    .resize(64, 64, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }, // Giữ alpha trong suốt
    })
    .webp({ quality: 90 })
    .toBuffer();
}

/**
 * Upload buffer lên Cloudinary dưới dạng WebP stream
 */
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
    // 1. Lấy tất cả badge đang active có icon_filename
    const [badges] = await db.query(
      "SELECT id, slug, badge_name, icon_filename, icon_url FROM level_badges WHERE is_active = 1 AND icon_filename IS NOT NULL AND icon_filename != ''"
    );

    if (badges.length === 0) {
      console.log("⚠️  Không tìm thấy badge nào có icon_filename trong DB.");
      process.exit(0);
    }

    console.log(`🚀 Tìm thấy ${badges.length} badge — bắt đầu xử lý...\n`);
    console.log("─".repeat(60));

    let successCount = 0;
    let skipCount    = 0;
    let errorCount   = 0;

    for (const badge of badges) {
      const filePath = path.join(BADGE_DIR, badge.icon_filename);
      const label    = `"${badge.badge_name}" (${badge.icon_filename})`;

      // Kiểm tra file tồn tại
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  Bỏ qua ${label} — file không tồn tại: ${filePath}`);
        skipCount++;
        continue;
      }

      try {
        process.stdout.write(`📤 Xử lý ${label}...`);

        // a. Sharp: trim → resize → WebP buffer
        const buffer = await processImage(filePath);

        // b. Upload lên Cloudinary
        const publicId = `badge_${badge.slug}`;
        const result   = await uploadBuffer(buffer, publicId);

        // c. Cập nhật icon_url trong DB
        await db.query(
          "UPDATE level_badges SET icon_url = ? WHERE id = ?",
          [result.secure_url, badge.id]
        );

        console.log(` ✓`);
        console.log(`   📎 ${result.secure_url}`);
        successCount++;

        // Tránh rate-limit Cloudinary
        await sleep(400);
      } catch (err) {
        console.error(` ✗\n   ❌ Lỗi: ${err.message}`);
        errorCount++;
      }
    }

    console.log("\n" + "─".repeat(60));
    console.log(`✅ Thành công : ${successCount}`);
    if (skipCount  > 0) console.log(`⏭️  Bỏ qua     : ${skipCount}`);
    if (errorCount > 0) console.log(`❌ Lỗi        : ${errorCount}`);
    console.log("─".repeat(60));

  } catch (err) {
    console.error("❌ Script thất bại:", err.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
