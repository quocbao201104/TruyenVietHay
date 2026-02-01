import { defineStore } from "pinia";
import { ref } from "vue";
import { 
    getPublicStories,
    getAdminStories,
    getStoryById,
    approveOrRejectStoryApi,
    updateStoryAdmin,
    deleteStoryAdmin,
    getTopMonthlyStories,
} from "./story.service";
import { getAllCategories } from "@/modules/category/category.service";
import { getTopViewStories } from "@/modules/topview/topview.service";
import { getTopRatedStories } from "@/modules/ranking/ranking.service";
import { useAppToast } from "@/composables/useAppToast";

/**
 * Cache structure for TTL-based caching
 */
interface CachedData<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export const useStoryStore = defineStore("story", () => {
    // --- State ---
    // --- State ---
    const stories = ref<any[]>([]); // Public stories
    const currentStory = ref<any | null>(null); // Detail

    // Admin State
    const adminStories = ref<any[]>([]);
    const adminStoriesPagination = ref({
        total: 0,
        current_page: 1,
        total_pages: 1,
    });
    
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Toast
    // Ensure composable exists or handle gracefully
    let toast = { showSuccessToast: (msg:string) => {}, showErrorToast: (msg:string) => console.error(msg) };
    try {
        toast = useAppToast();
    } catch(e) { console.warn("useAppToast not found"); }

    const { showSuccessToast, showErrorToast } = toast;
    
    // Like State
    const isLiked = ref(false);
    const likeCount = ref(0);

    // ===== CACHE STATE =====
    const cache = ref<Record<string, CachedData<any>>>({});

    /**
     * Check if cache is valid
     */
    const isCacheValid = (key: string): boolean => {
        const cached = cache.value[key];
        if (!cached) return false;
        return Date.now() - cached.timestamp < cached.ttl;
    };

    /**
     * Get cached data or fetch fresh
     * @param key - Cache key
     * @param fetchFn - Function to fetch data
     * @param ttl - Time to live in milliseconds
     */
    const getCachedOrFetch = async <T>(
        key: string,
        fetchFn: () => Promise<T>,
        ttl: number
    ): Promise<T> => {
        if (isCacheValid(key)) {
            if (import.meta.env.DEV) {
                console.log(`✅ Frontend Cache HIT: ${key}`);
            }
            return cache.value[key].data as T;
        }

        if (import.meta.env.DEV) {
            console.log(`❌ Frontend Cache MISS: ${key} - Fetching...`);
        }
        const data = await fetchFn();
        cache.value[key] = {
            data,
            timestamp: Date.now(),
            ttl,
        };
        return data;
    };

    /**
     * Manually clear cache
     */
    const clearCache = (key?: string) => {
        if (key) {
            delete cache.value[key];
        } else {
            cache.value = {};
        }
    };

    // --- Actions ---

    // 1. Story Public Logic
    const fetchStories = async (params: any = {}) => {
        loading.value = true;
        try {
            // Default params merged with passed params
            const res = await getPublicStories(params);
            stories.value = res.data || [];
        } catch (err: any) {
             error.value = err.message;
        } finally {
            loading.value = false;
        }
    };

    const fetchStoryById = async (id: number) => {
        loading.value = true;
        try {
            const res = await getStoryById(id);
            if (res) {
                currentStory.value = res;
                return res;
            }
        } catch (err: any) {
             const msg = err.response?.data?.message || err.message;
             error.value = msg;
             showErrorToast(msg);
        } finally {
            loading.value = false;
        }
    };

    const fetchStoryBySlug = async (slug: string) => {
        loading.value = true;
        currentStory.value = null; // Clear previous story
        try {
            // Need to import getStoryBySlug from service
            const { getStoryBySlug } = await import("./story.service");
            const res = await getStoryBySlug(slug);
             if (res) {
                currentStory.value = res;
                return res;
            }
        } catch (err: any) {
             const msg = err.response?.data?.message || "Failed to load story";
             error.value = msg;
             showErrorToast(msg);
        } finally {
            loading.value = false;
        }
    };

    // 3. Admin Logic
    const fetchAdminStories = async (params: any) => {
        loading.value = true;
        try {
            const result = await getAdminStories(params);
            adminStories.value = result.data || [];
            adminStoriesPagination.value = result.pagination;
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to load admin stories";
            showErrorToast(msg);
        } finally {
            loading.value = false;
        }
    };
    
    // 4. Author Logic
    const authorStories = ref<any[]>([]);
    const authorStoriesPagination = ref({
        total: 0,
        current_page: 1,
        total_pages: 1,
    });
    const authorStoriesLoading = ref(false);

    const fetchAuthorStories = async (params: any) => {
        authorStoriesLoading.value = true;
        try {
            const { getMyStories } = await import("./story.service");
            const result = await getMyStories(params);
            authorStories.value = result.data || [];
            authorStoriesPagination.value = result.pagination;
        } catch (err: any) {
             const msg = err.response?.data?.message || "Failed to load author stories";
             showErrorToast(msg);
        } finally {
             authorStoriesLoading.value = false;
        }
    };

    const approveOrRejectStory = async (storyId: number, action: 'duyet' | 'tu_choi') => {
        loading.value = true;
        try {
            const result = await approveOrRejectStoryApi(storyId, action);
            showSuccessToast(result.message);
            // Refresh logic could be here
            return result;
        } catch (err: any) {
            showErrorToast(err.message || "Failed to approve/reject");
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const updateStory = async (storyId: number, data: FormData) => {
        loading.value = true;
        try {
            const result = await updateStoryAdmin(storyId, data);
            showSuccessToast(result.message);
            return result;
        } catch (err: any) {
            showErrorToast(err.message || "Update failed");
            throw err;
        } finally {
             loading.value = false;
        }
    };

    const deleteStory = async (storyId: number) => {
        loading.value = true;
        try {
            const result = await deleteStoryAdmin(storyId);
            showSuccessToast(result.message);
            // Remove from local state
            adminStories.value = adminStories.value.filter(s => s.id !== storyId);
            return result;
        } catch (err: any) {
            showErrorToast(err.message || "Delete failed");
            throw err;
        } finally {
             loading.value = false;
        }
    };

    const clearData = () => {
        currentStory.value = null;
        currentStory.value = null;
        error.value = null;
    };


    // Like Logic
    const fetchLikeStatus = async (storyId: number) => {
        try {
            const { getLikeStatus } = await import("./story.service");
            const res = await getLikeStatus(storyId);
            isLiked.value = res.liked;
            likeCount.value = res.luot_thich;
        } catch (e) {
            console.error("Failed to fetch like status", e);
        }
    };

    // ===== CACHED HOMEPAGE DATA METHODS =====

    /**
     * Fetch categories with 30-minute cache
     */
    const fetchCategories = async () => {
        return getCachedOrFetch(
            'categories',
            () => getAllCategories(),
            30 * 60 * 1000 // 30 minutes
        );
    };

    /**
     * Fetch top view stories with 5-minute cache
     */
    const fetchTopViewStories = async (limit: number = 5) => {
        return getCachedOrFetch(
            `topView:${limit}`,
            () => getTopViewStories(limit),
            5 * 60 * 1000 // 5 minutes
        );
    };

    /**
     * Fetch top monthly stories with 10-minute cache
     */
    const fetchTopMonthlyStories = async (limit: number = 5) => {
        return getCachedOrFetch(
            `topMonthly:${limit}`,
            () => getTopMonthlyStories(limit),
            10 * 60 * 1000 // 10 minutes
        );
    };

    /**
     * Fetch top rated stories with 10-minute cache
     */
    const fetchTopRatedStories = async (limit: number = 5) => {
        return getCachedOrFetch(
            `topRated:${limit}`,
            () => getTopRatedStories(limit),
            10 * 60 * 1000 // 10 minutes
        );
    };

    /**
     * Fetch new stories with 3-minute cache
     */
    const fetchNewStories = async (limit: number = 10) => {
        return getCachedOrFetch(
            `newStories:${limit}`,
            async () => {
                const res = await getPublicStories({
                    page: 1,
                    limit,
                    sort_by: "thoi_gian_cap_nhat",
                    order: "DESC"
                });
                return res.data;
            },
            3 * 60 * 1000 // 3 minutes
        );
    };

    /**
     * Fetch completed stories with 5-minute cache
     */
    const fetchCompletedStories = async (limit: number = 10) => {
        return getCachedOrFetch(
            `completedStories:${limit}`,
            async () => {
                const res = await getPublicStories({
                    page: 1,
                    limit,
                    trang_thai: "hoan_thanh",
                    sort_by: "thoi_gian_cap_nhat",
                    order: "DESC"
                });
                return res.data;
            },
            5 * 60 * 1000 // 5 minutes
        );
    };

    const toggleLike = async (storyId: number) => {
        try {
            const { toggleLike } = await import("./story.service");
            const res = await toggleLike(storyId);
            isLiked.value = res.liked;
            likeCount.value = res.luot_thich;
            
            // Update currentStory if it exists to reflect immediate change in UI if used there
            if (currentStory.value && currentStory.value.id === storyId) {
                currentStory.value.luot_thich = res.luot_thich;
            }
            return res;
        } catch (err: any) {
            if (err.response?.status === 401) {
                showErrorToast("Vui lòng đăng nhập để thích truyện");
            } else {
                showErrorToast("Có lỗi xảy ra khi thích truyện");
            }
            throw err;
        }
    };

    return {
        // State
        stories,
        currentStory,
        adminStories,
        adminStoriesPagination,
        authorStories,
        authorStoriesPagination,
        authorStoriesLoading,
        loading,
        error,
        isLiked,
        likeCount,
        // Actions
        fetchStories,
        fetchStoryById,
        fetchStoryBySlug,
        fetchAdminStories,
        fetchAuthorStories,
        approveOrRejectStory,
        updateStory,
        deleteStory,
        clearData,
        fetchLikeStatus,
        toggleLike,
        // Cached homepage methods
        fetchCategories,
        fetchTopViewStories,
        fetchTopMonthlyStories,
        fetchTopRatedStories,
        fetchNewStories,
        fetchCompletedStories,
        clearCache,
    };
});
