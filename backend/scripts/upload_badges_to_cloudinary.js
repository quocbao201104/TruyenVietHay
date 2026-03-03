/**
 * scripts/upload_badges_to_cloudinary.js
 *
 * ONE-TIME script — uploads badge PNGs from backend/public/badge to Cloudinary
 * and writes the CDN URLs back into the level_badges.icon_url column.
 *
 * Usage:
 *   cd backend
 *   node scripts/upload_badges_to_cloudinary.js
 *
 * Prerequisites:
 *   - .env must contain CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *   - The level_badges table must exist (run migration 09 first)
 *   - badge PNGs must be present in backend/public/badge/
 */

require("dotenv").config();
const path = require("path");
const fs   = require("fs");
const cloudinary = require("cloudinary").v2;
const db   = require("../config/db");

// ── Cloudinary config ─────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const BADGE_DIR      = path.resolve(__dirname, "../public/badge");
const CLOUDINARY_FOLDER = "truyenviethay/badges";

// ── Helpers ───────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function uploadFile(filePath, publicId) {
  return cloudinary.uploader.upload(filePath, {
    folder:    CLOUDINARY_FOLDER,
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  try {
    // Fetch all badge rows that still need their icon_url populated
    const [badges] = await db.query(
      "SELECT id, slug, icon_filename FROM level_badges WHERE icon_url IS NULL"
    );

    if (badges.length === 0) {
      console.log("✅ All badges already have icon_url set. Nothing to do.");
      process.exit(0);
    }

    console.log(`🚀 Uploading ${badges.length} badge(s) to Cloudinary…\n`);

    for (const badge of badges) {
      const filePath = path.join(BADGE_DIR, badge.icon_filename);

      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found, skipping: ${filePath}`);
        continue;
      }

      console.log(`📤 Uploading "${badge.badge_name ?? badge.slug}" → ${badge.icon_filename}`);
      const result = await uploadFile(filePath, `badge_${badge.slug}`);

      await db.query(
        "UPDATE level_badges SET icon_url = ? WHERE id = ?",
        [result.secure_url, badge.id]
      );

      console.log(`   ✓ Uploaded → ${result.secure_url}`);

      // Be nice to Cloudinary rate limits
      await sleep(300);
    }

    console.log("\n✅ All badges uploaded successfully!");
  } catch (err) {
    console.error("❌ Upload failed:", err.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
