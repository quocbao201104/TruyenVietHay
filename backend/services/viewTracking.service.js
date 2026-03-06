/**
 * View Tracking Service
 *
 * Quản lý lượt xem chương/truyện với:
 * - Chống spam: TTL 30 phút theo user/IP
 * - Buffer view counts trong node-cache (không ghi trực tiếp vào DB)
 * - Batch sync MySQL qua cronjob (mỗi 5 phút)
 *
 * Dùng node-cache riêng cho view tracking, tách khỏi cache chung.
 */

const NodeCache = require("node-cache");

// =============================================================================
// CẤU HÌNH NODE-CACHE CHO VIEW TRACKING
// =============================================================================

/** TTL chống spam: 30 phút = 1800 giây cho CHAPTER */
const VIEW_SPAM_TTL_SECONDS = 30 * 60;

/** TTL chống spam: 24 giờ = 86400 giây cho NOVEL (Unique View) */
const NOVEL_VIEW_COOLDOWN_SECONDS = 24 * 60 * 60;

/**
 * Cache riêng cho View Tracking
 * - stdTTL: không set default TTL cho toàn bộ; mỗi key tự set TTL
 * - checkperiod: 120s - dọn key hết hạn mỗi 2 phút
 * - useClones: false - hiệu năng tốt hơn
 */
const viewCache = new NodeCache({
  stdTTL: 0, // TTL được set thủ công cho từng loại key
  checkperiod: 120,
  useClones: false,
});

/** Prefix cho key chống spam (viewed:user_123:chapter_456 hoặc viewed:ip_1.2.3.4:chapter_456) */
const SPAM_KEY_PREFIX = "viewed:";

/** Prefix cho key chống spam novel (viewed_novel:user_123:novel_456) */
const NOVEL_SPAM_KEY_PREFIX = "viewed_novel:";

/** Prefix cho bộ đếm view buffer (novel_1, chapter_456) */
const NOVEL_VIEW_PREFIX = "novel:";
const CHAPTER_VIEW_PREFIX = "chapter:";

// =============================================================================
// CHỐNG SPAM VIEW (RATE LIMITING VỚI TTL)
// =============================================================================

/**
 * Tạo định danh user: ưu tiên UserID nếu đăng nhập, fallback sang IP
 * Lưu ý: Nếu app chạy sau reverse proxy, cần app.set('trust proxy', 1) để req.ip chính xác
 * @param {object} req - Express request
 * @returns {string} - "user_123" hoặc "ip_1.2.3.4"
 */
function getViewerIdentifier(req) {
  if (req.user && req.user.id) {
    return `user_${req.user.id}`;
  }
  const forwarded = req.get?.("x-forwarded-for");
  const ip =
    (forwarded ? forwarded.split(",")[0].trim() : null) ||
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "unknown";
  return `ip_${String(ip).replace(/[^a-zA-Z0-9._-]/g, "_")}`;
}

/**
 * Kiểm tra user đã xem chương này trong TTL chưa
 * @param {string} viewerId - "user_123" hoặc "ip_1.2.3.4"
 * @param {number} chapterId - ID chương
 * @returns {boolean} - true nếu đã xem (spam), false nếu hợp lệ
 */
function hasViewedRecently(viewerId, chapterId) {
  const key = `${SPAM_KEY_PREFIX}${viewerId}:chapter_${chapterId}`;
  return viewCache.get(key) !== undefined;
}

/**
 * Đánh dấu user đã xem chương (set TTL 30 phút)
 * @param {string} viewerId
 * @param {number} chapterId
 */
function markAsViewed(viewerId, chapterId) {
  const key = `${SPAM_KEY_PREFIX}${viewerId}:chapter_${chapterId}`;
  viewCache.set(key, 1, VIEW_SPAM_TTL_SECONDS);
}

/**
 * Kiểm tra user đã xem truyện này trong 24h chưa
 */
function hasViewedNovelRecently(viewerId, novelId) {
  const key = `${NOVEL_SPAM_KEY_PREFIX}${viewerId}:novel_${novelId}`;
  return viewCache.get(key) !== undefined;
}

/**
 * Đánh dấu user đã xem truyện (set TTL 24h)
 */
function markNovelAsViewed(viewerId, novelId) {
  const key = `${NOVEL_SPAM_KEY_PREFIX}${viewerId}:novel_${novelId}`;
  viewCache.set(key, 1, NOVEL_VIEW_COOLDOWN_SECONDS);
}

// =============================================================================
// GHI NHẬN VIEW VÀO CACHE (BUFFER)
// =============================================================================

/**
 * Tăng bộ đếm view trong cache (atomic)
 * @param {number} novelId - ID truyện
 * @param {number} chapterId - ID chương
 */
function incrementViewCounts(novelId, chapterId, shouldIncrementNovel = true) {
  const novelKey = `${NOVEL_VIEW_PREFIX}${novelId}`;
  const chapterKey = `${CHAPTER_VIEW_PREFIX}${chapterId}`;

  const chapterCount = viewCache.get(chapterKey) || 0;
  viewCache.set(chapterKey, chapterCount + 1);

  if (shouldIncrementNovel) {
    const novelCount = viewCache.get(novelKey) || 0;
    viewCache.set(novelKey, novelCount + 1);
  }
}

// =============================================================================
// LUỒNG CHÍNH: GHI NHẬN 1 LƯỢT XEM HỢP LỆ
// =============================================================================

/**
 * Xử lý 1 lượt xem chương từ API
 * - Kiểm tra spam (đã xem trong 30 phút?)
 * - Nếu hợp lệ: đánh dấu đã xem + tăng buffer
 *
 * @param {object} req - Express request (có req.user nếu đăng nhập)
 * @param {number} novelId - ID truyện
 * @param {number} chapterId - ID chương
 * @returns {object} { counted: boolean, reason?: string }
 */
function recordChapterView(req, novelId, chapterId) {
  const viewerId = getViewerIdentifier(req);

  // 1. Kiểm tra spam chapter (30 phút)
  if (hasViewedRecently(viewerId, chapterId)) {
    return { counted: false, reason: "chapter_spam" };
  }

  // 2. Kiểm tra spam novel (24 giờ)
  const shouldIncrementNovel = !hasViewedNovelRecently(viewerId, novelId);
  // // 2. Không giới hạn spam 24h cho truyện nữa, mỗi lượt xem chương hợp lệ đều tính cho truyện
  // const shouldIncrementNovel = true;
  // 3. Mark viewed
  markAsViewed(viewerId, chapterId);
  if (shouldIncrementNovel) {
    markNovelAsViewed(viewerId, novelId);
  }

  // 4. Increment buffer
  incrementViewCounts(novelId, chapterId, shouldIncrementNovel);

  return { 
    counted: true, 
    novelIncremented: shouldIncrementNovel 
  };
}

// =============================================================================
// LẤY DỮ LIỆU BUFFER ĐỂ BATCH UPDATE (cho Cronjob)
// =============================================================================

/**
 * Lấy toàn bộ bộ đếm view từ cache
 * @returns {{ novels: Map<number, number>, chapters: Map<number, number> }}
 */
function getViewCountsSnapshot() {
  const novels = new Map();
  const chapters = new Map();

  const keys = viewCache.keys();

  for (const key of keys) {
    if (key.startsWith(NOVEL_VIEW_PREFIX)) {
      const id = parseInt(key.replace(NOVEL_VIEW_PREFIX, ""), 10);
      if (!isNaN(id)) {
        novels.set(id, viewCache.get(key) || 0);
      }
    } else if (key.startsWith(CHAPTER_VIEW_PREFIX)) {
      const id = parseInt(key.replace(CHAPTER_VIEW_PREFIX, ""), 10);
      if (!isNaN(id)) {
        chapters.set(id, viewCache.get(key) || 0);
      }
    }
    // Bỏ qua key viewed:... (spam keys - không xóa, để TTL tự hết)
  }

  return { novels, chapters };
}

/**
 * Reset bộ đếm view sau khi sync DB thành công
 * Chỉ xóa key novel: và chapter:, giữ lại viewed: (spam keys) để TTL tự hết
 */
function resetViewCounts() {
  const keys = viewCache.keys();
  let resetCount = 0;

  for (const key of keys) {
    if (key.startsWith(NOVEL_VIEW_PREFIX) || key.startsWith(CHAPTER_VIEW_PREFIX)) {
      viewCache.del(key);
      resetCount++;
    }
  }

  return resetCount;
}

/**
 * Thống kê debug (số key đang lưu)
 */
function getStats() {
  const keys = viewCache.keys();
  const novels = keys.filter((k) => k.startsWith(NOVEL_VIEW_PREFIX)).length;
  const chapters = keys.filter((k) => k.startsWith(CHAPTER_VIEW_PREFIX)).length;
  const spam = keys.filter((k) => k.startsWith(SPAM_KEY_PREFIX)).length;

  return {
    totalKeys: keys.length,
    novelKeys: novels,
    chapterKeys: chapters,
    spamKeys: spam,
  };
}

module.exports = {
  recordChapterView,
  getViewCountsSnapshot,
  resetViewCounts,
  getStats,
  VIEW_SPAM_TTL_SECONDS,
};
