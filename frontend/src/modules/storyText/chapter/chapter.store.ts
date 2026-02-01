import { defineStore } from "pinia";
import { ref } from "vue";
import { 
    getChapterBySlug, 
    getChapterById,
    getChaptersByStoryId, 
    createChapter as createChapterApi,
    updateChapter as updateChapterApi,
    deleteChapter as deleteChapterApi,
    approveOrRejectChapter as approveOrRejectChapterApi,
    getAdminChaptersByStoryId,
    approveAllChaptersByStoryId,
    type Chapter 
} from "./chapter.service";
import { useAppToast } from "@/composables/useAppToast";

export const useChapterStore = defineStore("chapter", () => {
    const currentChapter = ref<Chapter | null>(null);
    const chapterList = ref<Chapter[]>([]); 
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Toast
    let toast = { showSuccessToast: (msg:string) => {}, showErrorToast: (msg:string) => console.error(msg) };
    try {
        toast = useAppToast();
    } catch(e) { console.warn("useAppToast not found"); }

    const { showSuccessToast, showErrorToast } = toast;

    // Cache
    const contentCache = ref<Map<string, Chapter>>(new Map());

    const cacheChapter = (slug: string, chapter: Chapter) => {
        if (!contentCache.value.has(slug)) {
             contentCache.value.set(slug, chapter);
             // Optional: Limit cache size (LRU) or TTL if memory is a concern
             // For text chapters, memory usage is usually low (10-50KB per chapter)
             // Clean cache if too big
             if (contentCache.value.size > 20) {
                 const firstKey = contentCache.value.keys().next().value;
                 if (firstKey) contentCache.value.delete(firstKey);
             }
        }
    };

    const fetchChapter = async (slug: string, storySlug: string, isPreload = false) => {
        // Don't set global loading state for preloads
        if (!isPreload) {
            loading.value = true;
            error.value = null;
        }

        try {
            // Check cache first
            if (contentCache.value.has(slug)) {
                // If this is the active chapter (not preload), update currentChapter
                if (!isPreload) {
                   console.log(`✅ Chapter Cache HIT: ${slug}`);
                   currentChapter.value = contentCache.value.get(slug) || null;
                }
                return; // Done
            }

            // Fetch from API
            console.log(`❌ Chapter Cache MISS: ${slug} - Fetching...`);
            const data = await getChapterBySlug(slug, storySlug);
            
            // Validate data before caching
            if (data) {
                cacheChapter(slug, data);
                if (!isPreload) {
                    currentChapter.value = data;
                }
            }

            // If we have story ID and nav list is empty, fetch nav list
            if (data?.truyen_id && chapterList.value.length === 0) {
                 await fetchChapterList(data.truyen_id);
            }

        } catch (err: any) {
            if (!isPreload) {
                 error.value = err.message || "Failed to load chapter";
            } else {
                console.warn(`Failed to preload chapter ${slug}:`, err.message);
            }
        } finally {
            if (!isPreload) {
                loading.value = false;
            }
        }
    };

    const preloadChapter = async (slug: string, storySlug: string) => {
        // Use requestIdleCallback if available to avoid blocking main thread
        // or just call fetchChapter with isPreload=true
        if (contentCache.value.has(slug)) return; // Already cached

        // Simple delay to let main render finish first
        setTimeout(() => {
             fetchChapter(slug, storySlug, true);
        }, 1000);
    };

    const fetchChapterById = async (id: number) => {
        loading.value = true;
        error.value = null;
        try {
            const chap = await getChapterById(id);
            // Don't overwrite currentChapter if it's being used for reading view, 
            // but for editor we might want to return it or set it.
            // Let's just return it to keep it simple for the editor.
            return chap;
        } catch (err: any) {
            error.value = err.message || "Failed to load chapter by ID";
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchChapterList = async (storyId: number) => {
        try {
            // Fetch all chapters to build navigation
            const res = await getChaptersByStoryId(storyId, 1, 100000);
            // Backend returns { chapters: [...] }
            chapterList.value = res.chapters.sort((a: Chapter, b: Chapter) => a.so_chuong - b.so_chuong);
        } catch (error) {
            console.error("Failed to load chapter list for navigation:", error);
        }
    };

    const createChapter = async (data: any) => {
        loading.value = true;
        try {
            const res = await createChapterApi(data);
            showSuccessToast("Thêm chương thành công!");
            return res;
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Failed to create chapter";
            showErrorToast(msg);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const updateChapter = async (id: number, data: any) => {
        loading.value = true;
        try {
            const res = await updateChapterApi(id, data);
            showSuccessToast("Cập nhật chương thành công!");
            // Verify cache update logic (if we update a chapter, we should invalidate cache)
            // But updateChapter usually happens in admin view
            // If we have access to slug, we should delete from cache. 
            // For now, clear entire cache to be safe
            clearCache();
            return res;
        } catch (err: any) {
             const msg = err.response?.data?.message || err.message || "Failed to update chapter";
            showErrorToast(msg);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const deleteChapter = async (id: number) => {
        loading.value = true;
        try {
            await deleteChapterApi(id);
            showSuccessToast("Xóa chương thành công!");
            // Remove from local list if present
            chapterList.value = chapterList.value.filter(c => c.id !== id);
            clearCache(); // Invalidate cache
        } catch (err: any) {
             const msg = err.response?.data?.message || err.message || "Failed to delete chapter";
            showErrorToast(msg);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const approveChapter = async (id: number, action: 'duyet' | 'tu_choi') => {
        loading.value = true;
        try {
            const res = await approveOrRejectChapterApi(id, action);
            showSuccessToast(res.message || "Duyệt/Từ chối thành công");
            return res;
        } catch (err: any) {
             const msg = err.response?.data?.message || err.message || "Failed to approve/reject chapter";
            showErrorToast(msg);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchAdminChapterList = async (storyId: number) => {
        loading.value = true;
        try {
            const res = await getAdminChaptersByStoryId(storyId);
            chapterList.value = res.chapters.sort((a: any, b: any) => a.so_chuong - b.so_chuong);
        } catch (err: any) {
             const msg = err.response?.data?.message || err.message || "Failed to load admin chapter list";
             showErrorToast(msg);
             console.error(msg);
        } finally {
            loading.value = false;
        }
    };

    const approveAllChapters = async (storyId: number) => {
        loading.value = true;
        try {
            const res = await approveAllChaptersByStoryId(storyId);
            showSuccessToast("Duyệt tất cả chương thành công!");
             // Refresh list
            await fetchAdminChapterList(storyId);
            return res;
        } catch (err: any) {
             const msg = err.response?.data?.message || err.message || "Failed to approve all chapters";
            showErrorToast(msg);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const clearChapterList = () => {
        chapterList.value = [];
        currentChapter.value = null;
    };
    
    const clearCache = () => {
        contentCache.value.clear();
    };

    return {
        currentChapter,
        chapterList,
        loading,
        error,
        fetchChapter,
        preloadChapter, // New Action
        fetchChapterById,
        fetchChapterList,
        fetchAdminChapterList,
        createChapter,
        updateChapter,
        deleteChapter,
        approveChapter,
        approveAllChapters,
        clearChapterList,
        clearCache
    };


});
