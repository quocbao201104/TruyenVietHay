<template>
  <div class="author-dashboard-page">
    <main class="dashboard-container">
      <h1 class="page-title">Bảng Điều Khiển Tác Giả</h1>

      <div class="stats-grid">
        <div class="stat-card">
           <div class="icon-wrapper stories-icon">
             <i class="fas fa-book"></i>
           </div>
           <div class="stat-info">
             <span class="stat-value">{{ totalStories }}</span>
             <span class="stat-label">Tổng số truyện</span>
           </div>
        </div>

        <div class="stat-card">
           <div class="icon-wrapper views-icon">
             <i class="fas fa-eye"></i>
           </div>
           <div class="stat-info">
             <span class="stat-value">{{ totalViews }}</span>
             <span class="stat-label">Tổng lượt xem</span>
           </div>
        </div>

        <div class="stat-card">
           <div class="icon-wrapper pending-icon">
             <i class="fas fa-clock"></i>
           </div>
           <div class="stat-info">
             <span class="stat-value">{{ pendingStories }}</span>
             <span class="stat-label">Truyện chờ duyệt</span>
           </div>
        </div>
      </div>

      <div class="recent-activity">
          <h2 class="section-title">Truyện Của Bạn</h2>
          <div v-if="loading" class="text-center py-4">Đang tải...</div>
          <div v-else-if="recentStories.length === 0" class="text-gray-400">Bạn chưa đăng truyện nào.</div>
          <div v-else class="story-list">
              <div v-for="story in recentStories" :key="story.id" class="story-item">
                  <div class="story-info">
                      <span class="story-name">{{ story.ten_truyen }}</span>
                      <span :class="['status-badge', getStatusClass(story.trang_thai_kiem_duyet)]">
                          {{ formatStatus(story.trang_thai_kiem_duyet) }}
                      </span>
                  </div>
                  <router-link :to="`/author/story/${story.id}/chapters`" class="manage-link">
                      Quản lý <i class="fas fa-arrow-right"></i>
                  </router-link>
              </div>
          </div>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useStoryStore } from '@/modules/storyText/story.store';

const storyStore = useStoryStore();

const loading = computed(() => storyStore.authorStoriesLoading);
const stories = computed(() => storyStore.authorStories);

const totalStories = computed(() => storyStore.authorStoriesPagination.total || 0);
const totalViews = computed(() => {
    return stories.value.reduce((acc, story) => acc + (story.luot_xem || 0), 0);
});
const pendingStories = computed(() => {
    return stories.value.filter(s => s.trang_thai_kiem_duyet === 'cho_duyet').length;
});

const recentStories = computed(() => stories.value.slice(0, 5));

const getStatusClass = (status: string) => {
    switch(status) {
        case 'duyet': return 'status-approved';
        case 'tu_choi': return 'status-rejected';
        default: return 'status-pending';
    }
};

const formatStatus = (status: string) => {
    const map: Record<string, string> = {
        'duyet': 'Đã Duyệt',
        'cho_duyet': 'Chờ Duyệt',
        'tu_choi': 'Từ Chối'
    };
    return map[status] || status;
};

onMounted(() => {
    storyStore.fetchAuthorStories({ limit: 100 }); // Fetch enough to calculate stats
});
</script>

<style scoped>
.author-dashboard-page {
    min-height: 100vh;
    background: #1a1d29;
    color: white;
    font-family: 'Manrope', sans-serif;
    display: flex;
    flex-direction: column;
}

.dashboard-container {
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    width: 100%;
}

.page-title {
    font-size: 2rem;
    color: #22c55e;
    margin-bottom: 2rem;
    font-weight: 800;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
}

.stat-card {
    background: rgba(36, 40, 52, 0.5);
    padding: 1.5rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    border: 1px solid rgba(255,255,255,0.05);
    transition: transform 0.2s;
}

.stat-card:hover {
    transform: translateY(-5px);
    border-color: #22c55e;
}

.icon-wrapper {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

.stories-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.views-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.pending-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

.stat-info {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 1.8rem;
    font-weight: 700;
}

.stat-label {
    color: #9ca3af;
    font-size: 0.9rem;
}

.section-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: #e0e0e0;
    border-left: 4px solid #22c55e;
    padding-left: 1rem;
}

.story-list {
    background: rgba(36, 40, 52, 0.5);
    border-radius: 12px;
    overflow: hidden;
}

.story-item {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.story-item:last-child {
    border-bottom: none;
}

.story-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.story-name {
    font-weight: 600;
    color: #e0e0e0;
}

.status-badge {
    padding: 2px 8px;
    border-radius: 99px;
    font-size: 0.75rem;
    font-weight: 700;
}
.status-approved { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.status-pending { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.status-rejected { background: rgba(239, 68, 68, 0.2); color: #f87171; }

.manage-link {
    color: #3b82f6;
    text-decoration: none;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: color 0.2s;
}

.manage-link:hover {
    color: #60a5fa;
    gap: 0.8rem;
}
</style>
