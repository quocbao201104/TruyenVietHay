// services/notification.services.js
const db = require("../config/db");
const storyModel = require("../models/story.model");
const { sanitizeText } = require("../utils/sanitize");

// ===== Notification Type Constants =====
const NOTIF_TYPE = {
  SYSTEM: 1,       // Hệ thống
  NEW_CHAPTER: 2,  // Truyện mới / Chương mới
  APPROVAL: 3,     // Phê duyệt (duyệt/từ chối)
};

// ===== Notification Templates =====
const NOTIF_TEMPLATE = {
  NEW_CHAPTER: (storyName) => `${storyName} đã có chương mới.`,
  CHAPTER_REJECTED: (storyName) => `Chương mới trong truyện ${storyName} đã bị từ chối.`,
  CHAPTER_APPROVED_AUTHOR: (storyName) => `Chương của bạn trong truyện ${storyName} đã được duyệt thành công.`,
  CHAPTER_REJECTED_AUTHOR: (storyName) => `Chương của bạn trong truyện ${storyName} đã bị từ chối.`,
  STORY_APPROVED: (storyName) => `Truyện ${storyName} của bạn đã được duyệt.`,
  STORY_REJECTED: (storyName) => `Truyện ${storyName} của bạn đã bị từ chối.`,
  STORY_PENDING_REVIEW: (storyName, author) => `Truyện "${storyName}" của tác giả ${author} cần được kiểm duyệt.`,
};

/**
 * Core notification sender
 * @param {number} user_id
 * @param {string} content - Notification text
 * @param {number} type - NOTIF_TYPE constant
 * @param {number|null} target_id - truyen_id or chapter_id for deep linking
 */
const sendNotification = async (user_id, content, type = NOTIF_TYPE.SYSTEM, target_id = null) => {
  try {
    const safeContent = sanitizeText(content);
    const query = `
      INSERT INTO thong_bao (user_id, content, is_read, type, target_id)
      VALUES (?, ?, 0, ?, ?)
    `;
    await db.query(query, [user_id, safeContent, type, target_id]);
  } catch (error) {
    console.error("Error sending notification:", error);
    throw new Error("Có lỗi xảy ra khi gửi thông báo.");
  }
};

// Gửi thông báo cho người theo dõi khi có chương mới hoặc bị từ chối
const notifyFollowersAboutChapterUpdate = async (storyId, tenTruyen, action) => {
  try {
    const followers = await storyModel.getFollowers(storyId);
    const content = action === "duyet"
      ? NOTIF_TEMPLATE.NEW_CHAPTER(tenTruyen)
      : NOTIF_TEMPLATE.CHAPTER_REJECTED(tenTruyen);

    await Promise.all(
      followers.map((follower) =>
        sendNotification(follower.user_id, content, NOTIF_TYPE.NEW_CHAPTER, storyId)
      )
    );
  } catch (error) {
    console.error("Error notifying followers:", error);
    throw new Error("Có lỗi xảy ra khi thông báo cho người theo dõi.");
  }
};

// Gửi thông báo cho tất cả admin
const sendNotificationToAdmins = async (content, type = NOTIF_TYPE.APPROVAL, target_id = null) => {
  try {
    const [admins] = await db.query(
      "SELECT id FROM users_new WHERE role = 'admin'"
    );

    await Promise.all(
      admins.map((admin) => sendNotification(admin.id, content, type, target_id))
    );
  } catch (error) {
    console.error("Error sending notification to admins:", error);
    throw new Error("Không thể gửi thông báo cho admin.");
  }
};

// Gửi thông báo cho tác giả khi truyện được duyệt hoặc từ chối
const notifyAuthorAboutStoryApproval = async (userId, storyId, tenTruyen, action) => {
  try {
    const content = action === "duyet"
      ? NOTIF_TEMPLATE.STORY_APPROVED(tenTruyen)
      : NOTIF_TEMPLATE.STORY_REJECTED(tenTruyen);

    await sendNotification(userId, content, NOTIF_TYPE.APPROVAL, storyId);
  } catch (error) {
    console.error("Error notifying author:", error);
    throw new Error("Có lỗi xảy ra khi gửi thông báo cho tác giả.");
  }
};

module.exports = {
  sendNotification,
  notifyFollowersAboutChapterUpdate,
  notifyAuthorAboutStoryApproval,
  sendNotificationToAdmins,
  NOTIF_TYPE,
  NOTIF_TEMPLATE,
};
