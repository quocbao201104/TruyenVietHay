<template>
  <div class="comment-section">
    <h3 class="section-title">Bình Luận ({{ comments.length }})</h3>

    <!-- Comment Form -->
    <div class="comment-form" v-if="isLoggedIn">
      <div class="form-row">
        <div class="form-avatar">
          <img
            :src="getAvatarUrl(authStore.user?.avatar)"
            :alt="authStore.user?.username"
            class="avatar-img form-av-img"
          />
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
            :src="getAvatarUrl(comment.author_avatar)"
            :alt="comment.author_name"
            class="avatar-img"
            @error="onAvatarError"
          />
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
                    :src="getAvatarUrl(reply.author_avatar)"
                    :alt="reply.author_name"
                    class="avatar-img sm"
                    @error="onAvatarError"
                  />
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
                :src="getAvatarUrl(authStore.user?.avatar)"
                :alt="authStore.user?.username"
                class="avatar-img sm"
              />
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
/* ── Biến cục bộ & Nền tảng ──────────────────────────────────────────────────── */
.comment-section {
  --aura-primary: #34d399;
  --aura-bg: #0b0f19;
  --bubble-bg: rgba(19, 27, 44, 0.6);
  --border-light: rgba(52, 211, 153, 0.15);
  
  margin-top: 2rem;
  padding: 1.5rem 0;
  font-family: 'Be Vietnam Pro', sans-serif;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--aura-primary);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(52, 211, 153, 0.3);
}

/* ── Truyền Âm Phù (Comment Form) ───────────────────────────────────────────── */
.comment-form, .reply-form { margin-bottom: 1.5rem; }

.form-row, .reply-form {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.form-input-wrap { flex: 1; }

.comment-input {
  width: 100%;
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: #e2e8f0;
  font-size: 0.95rem;
  resize: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1.5;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

.comment-input:focus {
  outline: none;
  border-color: var(--aura-primary);
  background: rgba(52, 211, 153, 0.05);
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.15), inset 0 2px 4px rgba(0,0,0,0.2);
}

.comment-input::placeholder { color: #64748b; font-style: italic; }
.comment-input.sm { border-radius: 12px; font-size: 0.85rem; padding: 0.6rem 0.8rem; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

/* Nút bấm tụ linh */
.btn-submit {
  padding: 0.4rem 1.2rem;
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #0b0f19;
  border: none;
  border-radius: 8px;
  font-weight: 800;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(52, 211, 153, 0.2);
}
.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(52, 211, 153, 0.4);
}
.btn-submit:disabled { background: #334155; color: #94a3b8; cursor: not-allowed; box-shadow: none; }
.btn-submit.sm { padding: 0.3rem 1rem; font-size: 0.85rem; }

.btn-cancel {
  padding: 0.3rem 1rem;
  background: transparent;
  border: 1px solid #475569;
  color: #cbd5e1;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel:hover { background: rgba(244, 63, 94, 0.1); border-color: #f43f5e; color: #f43f5e; }

/* ── States ─────────────────────────────────────────────────────────────────── */
.loading-state, .error-state, .empty-state {
  text-align: center; padding: 3rem 1rem; color: #64748b; font-style: italic;
  background: var(--bubble-bg); border-radius: 16px; border: 1px dashed #334155;
}
.error-state { color: #f43f5e; border-color: rgba(244, 63, 94, 0.3); }

/* ── Danh sách bình luận ────────────────────────────────────────────────────── */
.comments-list { display: flex; flex-direction: column; gap: 1.5rem; }

.fb-comment {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  animation: fadeIn 0.4s ease-out forwards;
}

.fb-body { flex: 1; min-width: 0; }

/* ── Avatar Thần Thức ───────────────────────────────────────────────────────── */
.avatar-img {
  width: 42px; height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-light);
  flex-shrink: 0;
  background: #1e293b;
  box-shadow: 0 0 10px rgba(0,0,0,0.3);
}
.avatar-img.form-av-img { border-color: var(--aura-primary); }
.avatar-img.sm { width: 32px; height: 32px; }

/* ── Khí Tràng Bình Luận (Bubble) ───────────────────────────────────────────── */
.fb-bubble {
  display: inline-block;
  position: relative;
  background: var(--bubble-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 4px 16px 16px 16px;
  padding: 0.7rem 1rem;
  max-width: 100%;
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: border-color 0.3s, transform 0.2s;
}
.fb-bubble:hover { border-color: var(--border-light); }

.comment-text {
  color: #e2e8f0;
  font-size: 0.95rem;
  line-height: 1.6;
  white-space: pre-line;
  margin: 0.4rem 0 0;
  word-break: break-word;
}

/* Nút xóa thần tốc */
.btn-delete {
  position: absolute;
  top: 8px; right: 8px;
  background: rgba(244, 63, 94, 0.1);
  border: none;
  color: #f43f5e;
  cursor: pointer;
  font-size: 0.8rem;
  width: 24px; height: 24px;
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s;
  display: flex; justify-content: center; align-items: center;
}
.fb-bubble:hover .btn-delete { opacity: 1; transform: scale(1); }
.btn-delete:hover { background: #f43f5e; color: #fff; }

/* ── Thanh trạng thái (Meta) ────────────────────────────────────────────────── */
.fb-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0.4rem 0 0 0.8rem;
}

.meta-time { font-size: 0.8rem; color: #64748b; }
.meta-sep { color: #334155; font-size: 0.8rem; }

.meta-btn {
  background: none; border: none;
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}
.meta-btn:hover { color: var(--aura-primary); text-shadow: 0 0 5px rgba(52, 211, 153, 0.4); }

/* ── Linh Mạch (Replies Section) ────────────────────────────────────────────── */
.fb-replies-wrap { margin-top: 1rem; position: relative; }

/* Nút mở rộng mượt mà */
.btn-expand-replies, .btn-collapse-replies {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px dashed #334155;
  color: #cbd5e1;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  transition: all 0.3s;
}
.btn-expand-replies:hover, .btn-collapse-replies:hover {
  color: var(--aura-primary);
  border-color: var(--aura-primary);
  background: rgba(52, 211, 153, 0.05);
}

.fb-replies {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  padding-left: 2rem; /* Tạo không gian cho đường kẻ cong */
}

/* Đường kẻ cong (Curved Thread Line) nối từ avatar cha xuống các con */
.fb-replies::before {
  content: "";
  position: absolute;
  top: -20px;
  bottom: 20px;
  left: 0.5rem;
  width: 1.5rem;
  border-left: 2px solid rgba(255, 255, 255, 0.08);
  border-bottom: 2px solid rgba(255, 255, 255, 0.08);
  border-bottom-left-radius: 12px;
  pointer-events: none;
}

.fb-reply {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  position: relative;
  animation: fadeIn 0.3s ease-out forwards;
}

/* ── Pill Nameplate (Khung Tên Tác Giả) ─────────────────────────────────────── */
.author-nameplate {
  --plate-color: #64748b; 
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.8rem;
  border-radius: 50px;
  position: relative;
  overflow: hidden;
  background: color-mix(in srgb, var(--plate-color) 10%, #0b0f19);
  border: 1px solid color-mix(in srgb, var(--plate-color) 40%, transparent);
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  margin-bottom: 2px;
}

.comment-author {
  font-weight: 800;
  font-size: 0.85rem;
  white-space: nowrap;
  color: #fff;
  text-shadow: 0 0 8px color-mix(in srgb, var(--plate-color) 80%, transparent);
}

/* Hiệu ứng Shine cho Badge xịn */
.plate-shine {
  position: absolute; inset: 0;
  background: linear-gradient(105deg, transparent 35%, rgba(255, 255, 255, 0.2) 50%, transparent 65%);
  transform: translateX(-160%); pointer-events: none;
}
.author-nameplate[data-rarity="epic"] .plate-shine,
.author-nameplate[data-rarity="legendary"] .plate-shine {
  animation: plate-shine 3s ease-in-out infinite;
}

@keyframes plate-shine { 0% { transform: translateX(-160%); } 30%, 100% { transform: translateX(160%); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
