/**
 * View Sync Cronjob
 *
 * Chạy định kỳ mỗi 5 phút để:
 * 1. Lấy toàn bộ view counts từ node-cache (buffer)
 * 2. Bulk update vào MySQL (truyen_new.luot_xem, chuong.luot_xem)
 * 3. Cập nhật truyen_views (lượt xem theo ngày)
 * 4. Reset buffer trong cache sau khi sync thành công
 *
 * Xử lý lỗi: Nếu MySQL fail, KHÔNG reset buffer để tránh mất dữ liệu.
 */

const db = require("../config/db");
const viewTrackingService = require("../services/viewTracking.service");
const logger = require("../utils/logger");

/** Khoảng chạy: 1 phút (tính bằng giây cho node-cron) */
const CRON_SCHEDULE = "*/1 * * * *"; // Mỗi 1 phút

/**
 * Bulk update lượt xem truyện vào truyen_new
 * @param {Map<number, number>} novelCounts - Map<novelId, count>
 */
async function bulkUpdateNovelViews(novelCounts) {
  if (novelCounts.size === 0) return;

  // MySQL không có cách bulk "UPDATE ... SET col = col + ? WHERE id = ?" nhiều dòng 1 lệnh
  // Sử dụng CASE WHEN hoặc nhiều lệnh. Cách tối ưu: 1 transaction, nhiều UPDATE
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    for (const [novelId, count] of novelCounts) {
      if (count <= 0) continue;

      await connection.query(
        `UPDATE truyen_new 
         SET luot_xem = luot_xem + ?,
             hot_score = (rating * 0.4) + (rating_count * 0.3) + ((luot_xem + ?) * 0.3)
         WHERE id = ?`,
        [count, count, novelId]
      );
    }

    await connection.commit();
    logger.info(`[ViewSync] Updated ${novelCounts.size} novels`);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * Cập nhật truyen_views (lượt xem theo ngày) - upsert
 * @param {Map<number, number>} novelCounts
 */
async function bulkUpdateDailyViews(novelCounts) {
  if (novelCounts.size === 0) return;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    for (const [novelId, count] of novelCounts) {
      if (count <= 0) continue;

      await connection.query(
        `INSERT INTO truyen_views (truyen_id, ngay_xem, so_luot_xem) 
         VALUES (?, CURDATE(), ?) 
         ON DUPLICATE KEY UPDATE so_luot_xem = so_luot_xem + ?`,
        [novelId, count, count]
      );
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * Bulk update lượt xem chương vào chuong
 * @param {Map<number, number>} chapterCounts - Map<chapterId, count>
 */
async function bulkUpdateChapterViews(chapterCounts) {
  if (chapterCounts.size === 0) return;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    for (const [chapterId, count] of chapterCounts) {
      if (count <= 0) continue;

      await connection.query(
        `UPDATE chuong SET luot_xem = luot_xem + ? WHERE id = ?`,
        [count, chapterId]
      );
    }

    await connection.commit();
    logger.info(`[ViewSync] Updated ${chapterCounts.size} chapters`);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * Hàm chính: Đồng bộ view counts từ cache sang MySQL
 * Chỉ reset cache khi TẤT CẢ update thành công
 */
async function runViewSync() {
  const { novels, chapters } = viewTrackingService.getViewCountsSnapshot();

  const novelCount = [...novels.values()].reduce((a, b) => a + b, 0);
  const chapterCount = [...chapters.values()].reduce((a, b) => a + b, 0);

  if (novelCount === 0 && chapterCount === 0) {
    return; // Không có gì để sync
  }

  logger.info(`[ViewSync] Starting sync: ${novels.size} novels, ${chapters.size} chapters`);

  try {
    // 1. Update truyen_new (luot_xem + hot_score)
    await bulkUpdateNovelViews(novels);

    // 2. Update truyen_views (daily views)
    await bulkUpdateDailyViews(novels);

    // 3. Update chuong (luot_xem)
    await bulkUpdateChapterViews(chapters);

    // 4. CHỈ reset buffer khi mọi thứ thành công - tránh mất dữ liệu
    const resetCount = viewTrackingService.resetViewCounts();
    logger.info(`[ViewSync] Success. Reset ${resetCount} keys in cache`);
  } catch (err) {
    // KHÔNG reset cache - dữ liệu sẽ được sync ở lần chạy tiếp theo
    logger.error(`[ViewSync] MySQL error - NOT resetting cache to avoid data loss:`, err.message);
    logger.error(err.stack);
  }
}

/**
 * Khởi chạy cronjob (node-cron)
 */
function startViewSyncCron() {
  const cron = require("node-cron");

  cron.schedule(CRON_SCHEDULE, () => {
    runViewSync().catch((err) => {
      logger.error("[ViewSync] Unexpected error:", err);
    });
  });

  logger.info(`[ViewSync] Cronjob started: runs every 5 minutes (${CRON_SCHEDULE})`);
}

module.exports = {
  runViewSync,
  startViewSyncCron,
  CRON_SCHEDULE,
};
