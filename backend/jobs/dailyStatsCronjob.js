/**
 * Daily Stats Cronjob
 *
 * Chạy cuối mỗi ngày (ví dụ: 23:55) để aggregate dữ liệu từ:
 * - truyen_views (ngay_xem, so_luot_xem) -> views_count
 * - comments (truyen_id, created_at) -> comments_count
 *
 * INSERT hoặc ON DUPLICATE KEY UPDATE vào bảng daily_stats.
 * Logic: Với mỗi ngày trong quá khứ (hoặc hôm qua) chưa có trong daily_stats,
 * aggregate và upsert. Cronjob có thể chạy nhiều lần/ngày (idempotent) vì
 * dùng upsert - dữ liệu ngày đã qua không thay đổi.
 */

const db = require("../config/db");
const logger = require("../utils/logger");

/** Chạy lúc 23:55 mỗi ngày (hoặc 00:05 ngày mới - tùy timezone server) */
const CRON_SCHEDULE = "55 23 * * *";

/**
 * Aggregate và upsert daily_stats cho một ngày cụ thể
 * Nguồn: truyen_views.so_luot_xem, comments (count theo ngày)
 *
 * @param {string} targetDate - 'YYYY-MM-DD'
 */
async function aggregateAndUpsertForDate(targetDate) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Bước 1: Lấy tất cả novel_id có dữ liệu trong ngày targetDate
    // từ truyen_views (views) và comments (count). Merge 2 nguồn.

    // Subquery: Views per novel for targetDate
    const [viewRows] = await connection.query(
      `SELECT truyen_id AS novel_id, COALESCE(SUM(so_luot_xem), 0) AS views_count
       FROM truyen_views
       WHERE ngay_xem = ?
       GROUP BY truyen_id`,
      [targetDate]
    );

    // Subquery: Comments per novel for targetDate (exclude soft-deleted)
    const [commentRows] = await connection.query(
      `SELECT truyen_id AS novel_id, COUNT(*) AS comments_count
       FROM comments
       WHERE DATE(created_at) = ? AND (is_deleted = 0 OR is_deleted IS NULL)
       GROUP BY truyen_id`,
      [targetDate]
    );

    const viewMap = new Map(viewRows.map((r) => [r.novel_id, r.views_count]));
    const commentMap = new Map(commentRows.map((r) => [r.novel_id, r.comments_count]));

    const allNovelIds = new Set([...viewMap.keys(), ...commentMap.keys()]);

    if (allNovelIds.size === 0) {
      await connection.commit();
      return 0;
    }

    let upsertCount = 0;

    for (const novelId of allNovelIds) {
      const views = viewMap.get(novelId) || 0;
      const comments = commentMap.get(novelId) || 0;

      await connection.query(
        `INSERT INTO daily_stats (novel_id, date, views_count, comments_count)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           views_count = VALUES(views_count),
           comments_count = VALUES(comments_count)`,
        [novelId, targetDate, views, comments]
      );
      upsertCount++;
    }

    await connection.commit();
    logger.info(`[DailyStats] Upserted ${upsertCount} rows for date ${targetDate}`);
    return upsertCount;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * Chạy aggregate cho ngày hôm qua (dữ liệu đã đủ)
 */
async function runDailyStatsSync() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const targetDate = yesterday.toISOString().slice(0, 10);

  logger.info(`[DailyStats] Starting sync for date: ${targetDate}`);

  try {
    await aggregateAndUpsertForDate(targetDate);
  } catch (err) {
    logger.error("[DailyStats] Sync failed:", err.message);
    logger.error(err.stack);
  }
}

function startDailyStatsCron() {
  const cron = require("node-cron");

  cron.schedule(CRON_SCHEDULE, () => {
    runDailyStatsSync().catch((e) => logger.error("[DailyStats] Unexpected:", e));
  });

  logger.info(`[DailyStats] Cronjob started: runs daily at 23:55 (${CRON_SCHEDULE})`);
}

module.exports = {
  runDailyStatsSync,
  aggregateAndUpsertForDate,
  startDailyStatsCron,
  CRON_SCHEDULE,
};
