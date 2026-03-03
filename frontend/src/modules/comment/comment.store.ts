import { defineStore } from "pinia";
import { ref } from "vue";
import { getCommentsByStory, createComment, deleteComment, type Comment } from "./comment.service";
import { useAuthStore } from "@/modules/auth/auth.store"; // Assuming auth store exists

export const useCommentStore = defineStore("comment", () => {
    const comments = ref<Comment[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchComments = async (storyId: number) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await getCommentsByStory(storyId);
            comments.value = response.comments || [];
        } catch (err: any) {
            error.value = err.message || "Không thể tải bình luận";
        } finally {
            loading.value = false;
        }
    };

    const addComment = async (storyId: number, content: string, parentId?: number | null) => {
        const authStore = useAuthStore();
        if (!authStore.token) {
            throw new Error("Bạn cần đăng nhập để bình luận");
        }
        
        try {
            await createComment({ truyen_id: storyId, content, parent_id: parentId });
            // Refresh comments after successful creation
            await fetchComments(storyId); 
        } catch (err: any) {
            throw err;
        }
    };

    const removeComment = async (commentId: number, storyId: number) => {
        try {
            await deleteComment(commentId, storyId);
            // Refresh comments after deletion
            await fetchComments(storyId);
        } catch (err: any) {
            throw err;
        }
    };

    return {
        comments,
        loading,
        error,
        fetchComments,
        addComment,
        removeComment
    };
});
