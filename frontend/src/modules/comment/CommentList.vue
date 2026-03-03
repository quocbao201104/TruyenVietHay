<template>
  <div class="comment-section">
    <h3 class="section-title">Bình Luận ({{ comments.length }})</h3>

    <!-- Comment Form -->
    <div class="comment-form" v-if="isLoggedIn">
      <textarea
        v-model="newCommentContent"
        rows="3"
        class="comment-input"
        placeholder="Viết bình luận của bạn..."
      ></textarea>
      <div class="form-actions">
        <button
          @click="handleSubmit"
          :disabled="submitting || !newCommentContent.trim()"
          class="btn-submit"
        >
          {{ submitting ? "Đang gửi..." : "Gửi Bình Luận" }}
        </button>
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
      
      <div v-for="comment in comments" :key="comment.id" class="comment-item-container">
        <!-- Main Comment -->
        <div class="comment-item">
          <div class="comment-avatar">
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
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-author">{{ comment.author_name || 'Người dùng ẩn danh' }}</span>
              <UserBadge :badge="comment.author_badge" size="xs" />
              <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
            </div>
            <p class="comment-text">{{ comment.content }}</p>
            
            <div class="comment-actions">
                <button @click="toggleReply(comment.id)" class="btn-reply">
                    <i class="fas fa-reply"></i> Trả lời
                </button>
            </div>
          </div>
          <button 
            v-if="isAdmin" 
            @click="handleDelete(comment.id)"
            class="btn-delete"
            title="Xóa bình luận"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>

        <!-- Replies List -->
        <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
             <div v-for="reply in comment.replies" :key="reply.id" class="comment-item reply-item">
                <div class="comment-avatar small">
                    <img
                      v-if="reply.author_avatar"
                      :src="reply.author_avatar"
                      :alt="reply.author_name"
                      class="avatar-img small"
                      @error="onAvatarError"
                    />
                    <div v-else class="avatar-circle small">
                        {{ (reply.author_name || '?').charAt(0).toUpperCase() }}
                    </div>
                </div>
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">{{ reply.author_name || 'Người dùng ẩn danh' }}</span>
                        <UserBadge :badge="reply.author_badge" size="xs" />
                        <span class="comment-date">{{ formatDate(reply.created_at) }}</span>
                    </div>
                    <p class="comment-text">{{ reply.content }}</p>
                </div>
                 <button 
                    v-if="isAdmin" 
                    @click="handleDelete(reply.id)"
                    class="btn-delete"
                    title="Xóa bình luận"
                >
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        
        <!-- Reply Form -->
        <div v-if="replyingTo === comment.id" class="reply-form">
            <textarea
                v-model="replyContent"
                rows="2"
                class="comment-input"
                placeholder="Viết câu trả lời..."
                ref="replyInput"
            ></textarea>
            <div class="form-actions">
                 <button @click="cancelReply" class="btn-cancel">Hủy</button>
                <button
                    @click="handleReplySubmit(comment.id)"
                    :disabled="submittingReply || !replyContent.trim()"
                    class="btn-submit small"
                >
                    {{ submittingReply ? "Đang gửi..." : "Trả lời" }}
                </button>
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

const comments = computed(() => store.comments);
const loading = computed(() => store.loading);
const error = computed(() => store.error);
const isLoggedIn = computed(() => !!authStore.token);
const isAdmin = computed(() => authStore.user?.role === 'admin');

onMounted(() => {
  if (props.storyId) {
    store.fetchComments(props.storyId);
  }
});

watch(() => props.storyId, (newId) => {
  if (newId) store.fetchComments(newId);
});

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
        // Focus logic could go here if we had ref access to specific loop item
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
  return new Date(dateString).toLocaleString("vi-VN");
};

const onAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.style.display = 'none';
  // Show the sibling fallback letter circle
  const sibling = img.nextElementSibling as HTMLElement | null;
  if (sibling) sibling.style.display = 'flex';
};
</script>

<style scoped>
.comment-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4ade80;
  margin-bottom: 1.5rem;
  border-left: 4px solid #4ade80;
  padding-left: 1rem;
}

.comment-form {
  margin-bottom: 2rem;
}

.comment-input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 0.95rem;
  resize: vertical;
  transition: all 0.2s;
}

.comment-input:focus {
  outline: none;
  border-color: #4ade80;
  background: rgba(255,255,255,0.08);
}

.comment-input::placeholder {
  color: #9ca3af;
}

.form-actions {
  margin-top: 0.75rem;
  display: flex;
  justify-content: flex-end;
}

.btn-submit {
  padding: 0.5rem 1.5rem;
  background: #4ade80;
  color: #1a1d29;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #22c55e;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  background: #374151;
  color: #6b7280;
  cursor: not-allowed;
}

.login-prompt {
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  text-align: center;
  color: #d1d5db;
}

.login-link {
  color: #4ade80;
  text-decoration: none;
  font-weight: 600;
}

.login-link:hover {
  text-decoration: underline;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
  font-style: italic;
}

.error-state {
  color: #ef4444;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.2s;
  position: relative;
}

.comment-item:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(74, 222, 128, 0.3);
}

.comment-avatar {
  flex-shrink: 0;
}

.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(74, 222, 128, 0.4);
  flex-shrink: 0;
}

.avatar-img.small {
  width: 30px;
  height: 30px;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1d29;
  font-weight: 700;
  font-size: 1.1rem;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.comment-author {
  font-weight: 700;
  color: #4ade80;
  font-size: 0.95rem;
}

.comment-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.comment-text {
  color: #d1d5db;
  line-height: 1.6;
  white-space: pre-line;
}

.btn-delete {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0;
}

.comment-item:hover .btn-delete {
  opacity: 1;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}

/* Reply Styles */
.comment-item-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(255,255,255,0.05);
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
}

.comment-item {
    display: flex;
    gap: 1rem;
    position: relative;
    padding: 0; /* Remove padding from inner item as container handles it */
    background: transparent;
    border: none;
}

.replies-list {
    margin-left: 3rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.5rem;
    border-left: 2px solid rgba(255, 255, 255, 0.1);
    padding-left: 1rem;
}

.reply-item {
    background: rgba(255,255,255,0.03);
    padding: 0.75rem;
    border-radius: 6px;
}

.avatar-circle.small {
    width: 30px;
    height: 30px;
    font-size: 0.9rem;
}

.comment-actions {
    margin-top: 0.5rem;
    display: flex;
    gap: 1rem;
}

.btn-reply {
    background: transparent;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0;
    transition: color 0.2s;
}

.btn-reply:hover {
    color: #4ade80;
}

.reply-form {
    margin-left: 3rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}

.btn-cancel {
    background: transparent;
    border: 1px solid #4b5563;
    color: #9ca3af;
    padding: 0.4rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
}

.btn-cancel:hover {
    background: rgba(255,255,255,0.05);
    color: #fff;
}

.btn-submit.small {
    padding: 0.4rem 1rem;
    font-size: 0.85rem;
}
</style>
