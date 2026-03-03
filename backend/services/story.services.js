const notificationService = require("./notification.services");
const { NOTIF_TYPE } = require("./notification.services");
const db = require("../config/db");

// Duyệt truyện và gửi thông báo cho tác giả
const approveStory = async (story_id, action) => {
  try {
    const [rows] = await db.query(
      "SELECT user_id, ten_truyen, trang_thai_kiem_duyet FROM truyen_new WHERE id = ?",
      [story_id]
    );
    const story = rows[0];
    if (!story) {
      return { success: false, message: "Không tìm thấy truyện." };
    }

    const { user_id, ten_truyen, trang_thai_kiem_duyet } = story;

    if (action === "duyet" && trang_thai_kiem_duyet === "duyet") {
      return { success: false, message: "Truyện đã được duyệt trước đó." };
    }

    if (action === "tu_choi" && trang_thai_kiem_duyet === "tu_choi") {
      return { success: false, message: "Truyện đã bị từ chối trước đó." };
    }

    const newStatus = action === "duyet" ? "duyet" : "tu_choi";
    await db.query(
      "UPDATE truyen_new SET trang_thai_kiem_duyet = ? WHERE id = ?",
      [newStatus, story_id]
    );

    // Notify author with type=APPROVAL and target_id=story_id for deep linking
    await notificationService.notifyAuthorAboutStoryApproval(
      user_id,
      story_id,
      ten_truyen,
      action
    );

    return {
      success: true,
      message: `Truyện đã ${action === "duyet" ? "được duyệt" : "bị từ chối"}.`,
    };
  } catch (error) {
    console.error("Error approving/rejecting story:", error);
    throw error;
  }
};

module.exports = {
  approveStory,
};
