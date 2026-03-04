const commentModel = require("../models/comment.model");
const UserLevelHistory = require("../models/userLevelHistory.model");
const InventoryModel = require("../models/inventory.model");
const { getOrSet, invalidate } = require("../utils/cache");

const LIMIT = 10;

// Cache TTL: 60s — comments change frequently, keep short
const COMMENT_CACHE_TTL = 60;

const cacheKey = (truyenId, page) => `comments:${truyenId}:${page}`;

// ─── Internal fetch (no cache) ────────────────────────────────────────────────
const fetchComments = async (truyenId, page) => {
  const offset   = (page - 1) * LIMIT;
  const comments = await commentModel.getCommentsByTruyen(truyenId, LIMIT, offset);

  // Collect all unique author user_ids so we can batch-fetch their level_ids & badges
  const userIds = [...new Set(
    comments.flatMap((c) => [c.user_id, ...(c.replies ?? []).map((r) => r.user_id)])
  )];

  // Batch fetch current level_id for all authors in one query
  const levelMap = await UserLevelHistory.getCurrentLevelsForUsers(userIds);
  
  // Batch fetch currently equipped badge for all authors in one query
  const badgeMap = await InventoryModel.getEquippedBadgesForUsers(userIds);

  const enrichComment = (obj) => {
    obj.author_level_id = levelMap.get(obj.user_id) ?? null;
    obj.author_badge    = badgeMap.get(obj.user_id) ?? null;
    return obj;
  };

  for (const comment of comments) {
    enrichComment(comment);
    const replies = await commentModel.getReplies(comment.id);
    comment.replies = replies
      .map((reply) => {
        reply.content = reply.is_deleted ? "[Bình luận đã bị xóa]" : reply.content;
        return enrichComment(reply);
      });
    comment.content = comment.is_deleted
      ? "[Bình luận đã bị xóa]"
      : comment.content;
  }

  return comments;
};

// ─── Public API ───────────────────────────────────────────────────────────────

exports.getComments = async (truyenId, page = 1) => {
  return getOrSet(
    cacheKey(truyenId, page),
    COMMENT_CACHE_TTL,
    () => fetchComments(truyenId, page)
  );
};

exports.addComment = async (userId, truyenId, content, parentId) => {
  if (!content.trim()) throw new Error("Nội dung bình luận trống.");
  await commentModel.createComment(truyenId, userId, content, parentId);
  // Invalidate ALL pages for this story so new comment shows immediately
  invalidate(`comments:${truyenId}`);
};

exports.removeComment = async (commentId, truyenId) => {
  await commentModel.softDeleteComment(commentId);
  // Invalidate cache for this story if truyenId is provided
  if (truyenId) invalidate(`comments:${truyenId}`);
};
