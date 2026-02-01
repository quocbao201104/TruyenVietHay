const express = require("express");
const router = express.Router();
const chapterController = require("../controllers/chapter.controller");
const { authenticateToken, authorizeRoles, optionalAuthenticateToken } = require("../middleware/auth");
// const {
// validateCreateChapter,
// validateUpdateChapter,
// } = require("../validators/chapter.validator"); // import validator

router.post(
  "/",
  authenticateToken,
  authorizeRoles("author", "admin"),
  chapterController.createChapter
);

// Lấy danh sách chương theo truyện (có phân trang)
router.get("/truyen/:id", chapterController.getChaptersByStoryId);

// Lấy danh sách chương cho admin (tất cả trạng thái)
router.get(
  "/admin/truyen/:id",
  authenticateToken,
  authorizeRoles("admin"),
  chapterController.getAdminChaptersByStoryId
);

// Lấy chi tiết 1 chương theo ID
router.get("/:id", chapterController.getChapterById);

router.get("/slug/:storySlug/:chapterSlug", optionalAuthenticateToken, chapterController.getChapterBySlug); //
// Lấy chi tiết 1 chương theo slug

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "author"),
  chapterController.updateChapter
); // Cập nhật chương theo ID (chỉ admin và tác giả mới được cập nhật)

// Duyệt hoặc từ chối chương (Admin)
router.put(
  "/:id/duyet-chuong",
  authenticateToken,
  authorizeRoles("admin"),
  chapterController.approveOrRejectChapter
);

// Duyệt tất cả chương của truyện (Admin)
router.put(
  "/truyen/:id/duyet-tat-ca",
  authenticateToken,
  authorizeRoles("admin"),
  chapterController.approveAllChapters
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "author"),
  chapterController.deleteChapter
); // Xóa chương theo ID (chỉ admin và tác giả mới được xóa)

module.exports = router;
