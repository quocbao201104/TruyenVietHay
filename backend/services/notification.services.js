// services/notification.service.js
const db = require("../config/db");
const storyModel = require("../models/story.model");

// Hàm gửi thông báo chung cho user
const sendNotification = async (user_id, content, story_id = null) => {
  try {
    const query = `
      INSERT INTO thong_bao (user_id, content, truyen_id, status)
      VALUES (?, ?, ?, 'unread')
    `;
    await db.query(query, [user_id, content, story_id]);
  } catch (error) {
    console.error("Error sending notification:", error);
    throw new Error("Có lỗi xảy ra khi gửi thông báo.");
  }
};

// Gửi thông báo cho người theo dõi khi có chương mới hoặc bị từ chối
const notifyFollowersAboutChapterUpdate = async (
  storyId,
  tenTruyen,
  action
) => {
  try {
    const followers = await storyModel.getFollowers(storyId);
    const content =
      action === "duyet"
        ? `${tenTruyen} đã có chương mới.`
        : `Chương mới trong truyện ${tenTruyen} đã bị từ chối.`;

    await Promise.all(
      followers.map((follower) =>
        sendNotification(follower.user_id, content, storyId)
      )
    );
  } catch (error) {
    console.error("Error notifying followers:", error);
    throw new Error("Có lỗi xảy ra khi thông báo cho người theo dõi.");
  }
};
// Gửi thông báo cho tất cả admin
const sendNotificationToAdmins = async (content, link = null) => {
  try {
    const [admins] = await db.query(
      "SELECT id FROM users_new WHERE role = 'admin'"
    );

    await Promise.all(
      admins.map((admin) => sendNotification(admin.id, content, null))
    );
  } catch (error) {
    console.error("Error sending notification to admins:", error);
    throw new Error("Không thể gửi thông báo cho admin.");
  }
};
// Gửi thông báo cho tác giả khi truyện được duyệt hoặc từ chối
const notifyAuthorAboutStoryApproval = async (
  userId,
  storyId,
  tenTruyen,
  action
) => {
  try {
    const message =
      action === "duyet"
        ? `Truyện ${tenTruyen} của bạn đã được duyệt.`
        : `Truyện ${tenTruyen} của bạn đã bị từ chối.`;

    await sendNotification(userId, message, storyId);
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
};
