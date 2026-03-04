<template>
  <div class="comment-section">
    <h3 class="section-title">Bình Luận ({{ comments.length }})</h3>

    <!-- Comment Form -->
    <div class="comment-form" v-if="isLoggedIn">
      <div class="form-row">
        <div class="form-avatar">
          <img
            v-if="authStore.user?.avatar"
            :src="getAvatarUrl(authStore.user.avatar)"
            :alt="authStore.user.username"
            class="avatar-img form-av-img"
          />
          <div v-else class="avatar-circle form-av">
            {{ (authStore.user?.username || '?').charAt(0).toUpperCase() }}
          </div>
        </div>
        <div class="form-input-wrap">
          <textarea
            v-model="newCommentContent"
            rows="2"
            class="comment-input"
            placeholder="Viết bình luận..."
          ></textarea>
          <div class="form-actions">
            <button
              @click="handleSubmit"
              :disabled="submitting || !newCommentContent.trim()"
              class="btn-submit"
            >
              {{ submitting ? "Đang gửi..." : "Đăng" }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="login-prompt">
      <router-link to="/auth/login" class="login-link">Đăng nhập</router-link> để tham gia bình luận.
    </div>

    <!-- Error/Loading -->
    <div v-if="loading" class="loading-state">Đang tải bình luận...</div>
    <div v-if="error" class="error-state">{{ error }}</div>

    <!-- Comment List -->
    <div v-else class="comments-list">
      <div v-if="comments.length === 0" class="empty-state">
        Chưa có bình luận nào. Hãy là người đầu tiên!
      </div>

      <div v-for="comment in comments" :key="comment.id" class="fb-comment">

        <!-- Avatar -->
        <div class="fb-avatar">
          <img
            v-if="comment.author_avatar"
            :src="comment.author_avatar"
            :alt="comment.author_name"
            class="avatar-img"
            @error="onAvatarError"
          />
          <div v-else class="avatar-circle">
            {{ (comment.author_name || '?').charAt(0).toUpperCase() }}
          </div>
        </div>

        <!-- Body -->
        <div class="fb-body">
          <!-- Bubble -->
          <div class="fb-bubble">
            <div
              class="author-nameplate"
              :data-rarity="comment.author_badge?.rarity || 'none'"
              :style="{ '--plate-color': comment.author_badge?.color || '#555e6b' }"
            >
              <span class="plate-shine"></span>
              <span class="comment-author">{{ comment.author_name || 'Ẩn danh' }}</span>
              <UserBadge :badge="comment.author_badge" size="sm" />
            </div>
            <p class="comment-text">{{ comment.content }}</p>

            <!-- Admin delete (inside bubble, top-right) -->
            <button
              v-if="isAdmin"
              @click="handleDelete(comment.id)"
              class="btn-delete"
              title="Xóa bình luận"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Meta: time · reply -->
          <div class="fb-meta">
            <span class="meta-time">{{ formatDate(comment.created_at) }}</span>
            <span class="meta-sep">·</span>
            <button @click="toggleReply(comment.id)" class="meta-btn">Trả lời</button>
          </div>

          <!-- Replies -->
          <div v-if="comment.replies && comment.replies.length > 0" class="fb-replies-wrap">
            <!-- Collapse toggle -->
            <button
              v-if="!isRepliesExpanded(comment.id)"
              class="btn-expand-replies"
              @click="expandReplies(comment.id)"
            >
              <i class="fas fa-chevron-down"></i>
              Xem tất cả {{ comment.replies.length }} phản hồi
            </button>

            <!-- Replies list (expanded) -->
            <div v-else class="fb-replies">
              <div v-for="reply in comment.replies" :key="reply.id" class="fb-reply">
                <div class="fb-avatar sm">
                  <img
                    v-if="reply.author_avatar"
                    :src="reply.author_avatar"
                    :alt="reply.author_name"
                    class="avatar-img sm"
                    @error="onAvatarError"
                  />
                  <div v-else class="avatar-circle sm">
                    {{ (reply.author_name || '?').charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div class="fb-body">
                  <div class="fb-bubble">
                    <div
                      class="author-nameplate"
                      :data-rarity="reply.author_badge?.rarity || 'none'"
                      :style="{ '--plate-color': reply.author_badge?.color || '#555e6b' }"
                    >
                      <span class="plate-shine"></span>
                      <span class="comment-author">{{ reply.author_name || 'Ẩn danh' }}</span>
                      <UserBadge :badge="reply.author_badge" size="sm" />
                    </div>
                    <p class="comment-text">{{ reply.content }}</p>
                    <button
                      v-if="isAdmin"
                      @click="handleDelete(reply.id)"
                      class="btn-delete"
                      title="Xóa"
                    ><i class="fas fa-times"></i></button>
                  </div>
                  <div class="fb-meta">
                    <span class="meta-time">{{ formatDate(reply.created_at) }}</span>
                    <span class="meta-sep">·</span>
                    <button @click="toggleReply(comment.id)" class="meta-btn">Trả lời</button>
                  </div>
                </div>
              </div>

              <!-- Collapse back -->
              <button class="btn-collapse-replies" @click="collapseReplies(comment.id)">
                <i class="fas fa-chevron-up"></i> Thu gọn
              </button>
            </div>
          </div>

          <!-- Reply Form -->
          <div v-if="replyingTo === comment.id" class="reply-form">
            <div class="form-avatar">
              <img
                v-if="authStore.user?.avatar"
                :src="getAvatarUrl(authStore.user.avatar)"
                :alt="authStore.user.username"
                class="avatar-img sm"
              />
              <div v-else class="avatar-circle sm">
                {{ (authStore.user?.username || '?').charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="form-input-wrap">
              <textarea
                v-model="replyContent"
                rows="1"
                class="comment-input sm"
                placeholder="Viết câu trả lời..."
                ref="replyInput"
              ></textarea>
              <div class="form-actions">
                <button @click="cancelReply" class="btn-cancel">Hủy</button>
                <button
                  @click="handleReplySubmit(comment.id)"
                  :disabled="submittingReply || !replyContent.trim()"
                  class="btn-submit sm"
                >
                  {{ submittingReply ? "Đang gửi..." : "Trả lời" }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useCommentStore } from "./comment.store";
import { useAuthStore } from "@/modules/auth/auth.store";
import type { Comment } from "./comment.service";
import UserBadge from "@/components/gamification/UserBadge.vue";
import { getAvatarUrl } from "@/config/constants";

const props = defineProps<{
  storyId: number;
}>();

const store = useCommentStore();
const authStore = useAuthStore();

const newCommentContent = ref("");
const submitting = ref(false);

const replyingTo = ref<number | null>(null);
const replyContent = ref("");
const submittingReply = ref(false);

// Track which comment's replies are expanded
const expandedReplies = ref(new Set<number>());

const comments = computed(() => store.comments);
const loading = computed(() => store.loading);
const error = computed(() => store.error);
const isLoggedIn = computed(() => !!authStore.token);
const isAdmin = computed(() => authStore.user?.role === 'admin');

onMounted(() => {
  if (props.storyId) store.fetchComments(props.storyId);
});

watch(() => props.storyId, (newId) => {
  if (newId) store.fetchComments(newId);
});

// Reply expand/collapse
const isRepliesExpanded = (id: number) => expandedReplies.value.has(id);
const expandReplies    = (id: number) => { expandedReplies.value = new Set([...expandedReplies.value, id]); };
const collapseReplies  = (id: number) => { const s = new Set(expandedReplies.value); s.delete(id); expandedReplies.value = s; };

const handleSubmit = async () => {
  if (!newCommentContent.value.trim()) return;
  submitting.value = true;
  try {
    await store.addComment(props.storyId, newCommentContent.value);
    newCommentContent.value = "";
  } catch (err: any) {
    alert(err.message || "Lỗi gửi bình luận");
  } finally {
    submitting.value = false;
  }
};

const toggleReply = (commentId: number) => {
  if (replyingTo.value === commentId) {
    replyingTo.value = null;
  } else {
    replyingTo.value = commentId;
    replyContent.value = "";
    // Auto-expand replies when opening reply box
    expandReplies(commentId);
  }
};

const cancelReply = () => {
  replyingTo.value = null;
  replyContent.value = "";
};

const handleReplySubmit = async (parentId: number) => {
  if (!replyContent.value.trim()) return;
  submittingReply.value = true;
  try {
    await store.addComment(props.storyId, replyContent.value, parentId);
    replyingTo.value = null;
    replyContent.value = "";
  } catch (err: any) {
    alert(err.message || "Lỗi gửi câu trả lời");
  } finally {
    submittingReply.value = false;
  }
};

const handleDelete = async (commentId: number) => {
  if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;
  try {
    await store.removeComment(commentId, props.storyId);
  } catch (err: any) {
    alert(err.message || "Lỗi xóa bình luận");
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000); // seconds
  if (diff < 60)  return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return d.toLocaleDateString("vi-VN");
};

const onAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.style.display = "none";
};
</script>

<style scoped>
/* ── Section ────────────────────────────────────────────────────────────────── */
.comment-section {
  margin-top: 2rem;
  padding: 1.5rem 0;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #4ade80;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ── Comment Form ───────────────────────────────────────────────────────────── */
.comment-form { margin-bottom: 1.5rem; }

.form-row,
.reply-form {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}

.form-input-wrap { flex: 1; }

.comment-input {
  width: 100%;
  padding: 0.55rem 0.9rem;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  color: #fff;
  font-size: 0.9rem;
  resize: none;
  transition: border-color 0.2s, background 0.2s;
  line-height: 1.5;
}
.comment-input:focus {
  outline: none;
  border-color: rgba(74, 222, 128, 0.4);
  background: rgba(255,255,255,0.1);
}
.comment-input::placeholder { color: #6b7280; }
.comment-input.sm { border-radius: 16px; font-size: 0.85rem; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.4rem;
  padding: 0 0.4rem;
}

.btn-submit {
  padding: 0.35rem 1rem;
  background: #4ade80;
  color: #1a1d29;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.btn-submit:hover:not(:disabled) { background: #22c55e; transform: translateY(-1px); }
.btn-submit:disabled { background: #374151; color: #6b7280; cursor: not-allowed; }
.btn-submit.sm { padding: 0.3rem 0.8rem; font-size: 0.8rem; }

.btn-cancel {
  padding: 0.3rem 0.8rem;
  background: transparent;
  border: 1px solid #4b5563;
  color: #9ca3af;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel:hover { background: rgba(255,255,255,0.05); color: #fff; }

.login-prompt { color: #9ca3af; margin-bottom: 1.5rem; font-size: 0.9rem; }
.login-link { color: #4ade80; font-weight: 600; text-decoration: none; }
.login-link:hover { text-decoration: underline; }

/* ── States ─────────────────────────────────────────────────────────────────── */
.loading-state, .error-state, .empty-state {
  text-align: center; padding: 2rem; color: #9ca3af; font-style: italic;
}
.error-state { color: #ef4444; }

/* ── Comments list ──────────────────────────────────────────────────────────── */
.comments-list { display: flex; flex-direction: column; gap: 1rem; }

/* ── Facebook-style comment row ─────────────────────────────────────────────── */
.fb-comment,
.fb-reply {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
}

.fb-body { flex: 1; min-width: 0; }

/* ── Avatars ────────────────────────────────────────────────────────────────── */
.avatar-img {
  width: 36px; height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(74,222,128,0.3);
  flex-shrink: 0;
  display: block;
}
.avatar-img.form-av-img {
  width: 36px; height: 36px;
  border: 2px solid rgba(74,222,128,0.4);
}
.avatar-img.sm { width: 28px; height: 28px; }

.avatar-circle {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  display: flex; align-items: center; justify-content: center;
  color: #1a1d29; font-weight: 700; font-size: 1rem;
  flex-shrink: 0;
}
.avatar-circle.sm    { width: 28px; height: 28px; font-size: 0.8rem; }
.avatar-circle.form-av { font-size: 0.9rem; }

.fb-avatar    { flex-shrink: 0; }
.fb-avatar.sm { flex-shrink: 0; }

/* ── Bubble ─────────────────────────────────────────────────────────────────── */
.fb-bubble {
  display: inline-block;
  position: relative;
  background: rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 0.5rem 0.85rem 0.55rem;
  max-width: 100%;
  border: 1px solid rgba(255,255,255,0.07);
  transition: background 0.2s;
}
.fb-bubble:hover { background: rgba(255,255,255,0.09); }

.comment-text {
  color: #e5e7eb;
  font-size: 0.9rem;
  line-height: 1.55;
  white-space: pre-line;
  margin: 0.25rem 0 0;
  word-break: break-word;
}

/* Admin delete button inside bubble */
.btn-delete {
  position: absolute;
  top: 6px; right: 8px;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 2px 4px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s, color 0.2s;
}
.fb-bubble:hover .btn-delete { opacity: 1; }
.btn-delete:hover { color: #ef4444; }

/* ── Meta bar: time · reply ─────────────────────────────────────────────────── */
.fb-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0.2rem 0 0 0.6rem;
}

.meta-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.meta-sep { color: #4b5563; font-size: 0.65rem; }

.meta-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}
.meta-btn:hover { color: #4ade80; }

/* ── Replies section ────────────────────────────────────────────────────────── */
.fb-replies-wrap { margin-top: 0.5rem; margin-left: 0.2rem; }

.btn-expand-replies {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
}
.btn-expand-replies:hover { color: #4ade80; background: rgba(74,222,128,0.06); }

.fb-replies {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding-left: 0.4rem;
  border-left: 2px solid rgba(255,255,255,0.08);
}

.btn-collapse-replies {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.76rem;
  cursor: pointer;
  padding: 0.2rem 0.3rem;
  margin-top: 0.2rem;
  transition: color 0.2s;
}
.btn-collapse-replies:hover { color: #9ca3af; }

/* ══════════════════════════════════════════════════════════════════════════════
   Author Nameplate  –  Pill style, dynamic color via --plate-color
   ══════════════════════════════════════════════════════════════════════════════ */
.author-nameplate {
  --plate-color: #555e6b;          /* fallback — user chưa có badge */
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
  /* Pill shape */
  padding: 0.16em 0.8em 0.16em 0.85em;
  border-radius: 50px;
  position: relative;
  overflow: hidden;                /* cần cho shine swipe */
  /* Nền bán trong suốt màu badge ~15% */
  background: color-mix(in srgb, var(--plate-color) 15%, transparent);
  /* Viền sắc nét */
  border: 1.5px solid var(--plate-color);
  /* Glow 2 lớp: sát viền (đậm) + tỏa xa (nhạt) + inset */
  box-shadow:
    0 0 4px  color-mix(in srgb, var(--plate-color) 70%, transparent),
    0 0 14px color-mix(in srgb, var(--plate-color) 22%, transparent),
    inset 0 0 6px color-mix(in srgb, var(--plate-color) 10%, transparent);
  transition: box-shadow 0.3s ease;
}

.author-nameplate:hover {
  box-shadow:
    0 0 6px  color-mix(in srgb, var(--plate-color) 80%, transparent),
    0 0 20px color-mix(in srgb, var(--plate-color) 35%, transparent),
    inset 0 0 8px color-mix(in srgb, var(--plate-color) 15%, transparent);
}

/* ── Vệt sáng (Shine) — ẩn mặc định, bật cho epic/legendary ─────────────────── */
.plate-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 35%,
    rgba(255, 255, 255, 0.14) 50%,
    transparent 65%
  );
  transform: translateX(-160%);
  pointer-events: none;
}

/* Shine chạy cho epic và legendary */
.author-nameplate[data-rarity="epic"] .plate-shine,
.author-nameplate[data-rarity="legendary"] .plate-shine {
  animation: plate-shine 4.5s ease-in-out infinite;
}

@keyframes plate-shine {
  0%        { transform: translateX(-160%); }
  30%, 100% { transform: translateX(160%); }
}

/* ── Tên tác giả — mặc định: solid color ──────────────────────────────────────── */
.comment-author {
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.02em;
  white-space: nowrap;
  /* Chữ Trắng sáng để nổi bật trên nền trong suốt */
  color: #ffffff;
  text-shadow: 0 0 6px color-mix(in srgb, var(--plate-color) 80%, transparent);
}

/* ── Gradient text cho rare ──────────────────────────────────────────────────── */
.author-nameplate[data-rarity="rare"] .comment-author {
  background: linear-gradient(
    90deg,
    var(--plate-color),
    color-mix(in srgb, var(--plate-color) 55%, #ffffff)
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 3px color-mix(in srgb, var(--plate-color) 50%, transparent));
}

/* ── Gradient text VIP cho epic ──────────────────────────────────────────────── */
.author-nameplate[data-rarity="epic"] .comment-author {
  background: linear-gradient(
    90deg,
    var(--plate-color),
    color-mix(in srgb, var(--plate-color) 40%, #ffffff)
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 5px color-mix(in srgb, var(--plate-color) 60%, transparent));
}

/* ── Gradient text LEGENDARY — vivid & intense ───────────────────────────────── */
.author-nameplate[data-rarity="legendary"] .comment-author {
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--plate-color) 70%, #ff8800),
    var(--plate-color),
    color-mix(in srgb, var(--plate-color) 50%, #ffffff)
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter:
    drop-shadow(0 0 4px color-mix(in srgb, var(--plate-color) 70%, transparent))
    drop-shadow(0 0 1px rgba(255,255,255,0.3));
}
</style>
