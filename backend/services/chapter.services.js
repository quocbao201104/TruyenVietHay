const notificationService = require("./notification.services");
const { NOTIF_TYPE, NOTIF_TEMPLATE } = require("./notification.services");
const db = require("../config/db");
const StoryModel = require("../models/story.model");
const ChapterModel = require("../models/chapter.model");

// Duyệt chương và gửi thông báo
const approveChapter = async (chapter_id, action, reason) => {
  try {
    const [rows] = await db.query(
      `SELECT c.truyen_id, c.trang_thai AS trang_thai_kiem_duyet, t.user_id, t.ten_truyen AS ten_truyen
       FROM chuong c
       JOIN truyen_new t ON c.truyen_id = t.id
       WHERE c.id = ?`,
      [chapter_id]
    );
    const chapter = rows[0];
    if (!chapter) {
      return { success: false, message: "Không tìm thấy chương." };
    }

    const { truyen_id, user_id, trang_thai_kiem_duyet, ten_truyen } = chapter;

    if (action === "duyet" && trang_thai_kiem_duyet === "da_duyet") {
      return { success: false, message: "Chương đã được duyệt trước đó." };
    }

    if (action === "tu_choi" && trang_thai_kiem_duyet === "tu_choi") {
      return { success: false, message: "Chương đã bị từ chối trước đó." };
    }

    const newStatus = action === "duyet" ? "da_duyet" : "tu_choi";
    const rejectionReason = action === "tu_choi" ? reason : null;

    await db.query("UPDATE chuong SET trang_thai = ?, ly_do_tu_choi = ? WHERE id = ?", [
      newStatus,
      rejectionReason,
      chapter_id,
    ]);

    // Nếu duyệt, cập nhật thời gian cập nhật của truyện
    if (action === "duyet") {
      await db.query("UPDATE truyen_new SET thoi_gian_cap_nhat = NOW() WHERE id = ?", [truyen_id]);
      // Update newest chapter text and count
      await ChapterModel.updateChuongMoiNhat(truyen_id);
    }

    // Gửi thông báo cho tác giả (type: APPROVAL, target: story)
    let contentForAuthor = action === "duyet"
      ? NOTIF_TEMPLATE.CHAPTER_APPROVED_AUTHOR(ten_truyen)
      : NOTIF_TEMPLATE.CHAPTER_REJECTED_AUTHOR(ten_truyen);
    
    if (action === "tu_choi" && reason) {
        contentForAuthor += `. Lý do: ${reason}`;
    }

    await notificationService.sendNotification(
      user_id,
      contentForAuthor,
      NOTIF_TYPE.APPROVAL,
      truyen_id
    );

    // Gửi thông báo cho followers (type: NEW_CHAPTER, target: story)
    await notificationService.notifyFollowersAboutChapterUpdate(
      truyen_id,
      ten_truyen,
      action
    );

    return {
      success: true,
      message: `Chương đã ${action === "duyet" ? "được duyệt" : "bị từ chối"} và đã gửi thông báo.`,
    };
  } catch (error) {
    console.error("Error approving/rejecting chapter:", error);
    throw error;
  }
};

module.exports = {
  approveChapter,
};
