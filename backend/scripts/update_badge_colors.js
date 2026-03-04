/**
 * scripts/update_badge_colors.js
 * Cập nhật cột `color` của từng badge theo bảng màu mới.
 * Sau khi chạy xong tự invalidate cache bằng cách xóa cache key.
 *
 * Chạy: cd backend && node scripts/update_badge_colors.js
 */
require("dotenv").config();
const db = require("../config/db");

const COLOR_MAP = [
  { id: 1,  color: "#2ECC71" }, // Luyện Khí  
  { id: 2,  color: "#1ABC9C" }, // Trúc Cơ   
  { id: 3,  color: "#FF8C00" }, // Kim Đan   
  { id: 4,  color: "#E056FD" }, // Nguyên Anh 
  { id: 5,  color: "#8A2BE2" }, // Hóa Thần   
  { id: 6,  color: "#2980B9" }, // Luyện Hư   
  { id: 7,  color: "#5DADE2" }, // Hợp Thể   
  { id: 8,  color: "#FFD700" }, // Đại Thừa   
  { id: 13, color: "#E0FFFF" }, // Admin   
];

(async () => {
  try {
    console.log("🎨 Cập nhật màu badge...\n");

    for (const { id, color } of COLOR_MAP) {
      const [res] = await db.query(
        "UPDATE level_badges SET color = ? WHERE id = ?",
        [color, id]
      );
      if (res.affectedRows > 0) {
        console.log(`  ✓ id=${id}  → ${color}`);
      } else {
        console.log(`  ⚠ id=${id}  không tồn tại, bỏ qua`);
      }
    }

    console.log("\n✅ Xong! Khởi động lại backend để badge cache load màu mới.");
  } catch (err) {
    console.error("❌ Lỗi:", err.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
