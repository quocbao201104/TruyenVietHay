<template>
  <div class="tasks-page">
    <div class="tasks-container">
      <div class="page-header">
        <h1 class="page-title">Nhiệm Vụ & Quà Tặng</h1>
        <div class="header-decoration"></div>
      </div>

      <!-- Stats Section -->
      <div class="stats-card" v-if="currentLevel">
        <div class="stats-left">
          <div class="level-badge-large" :class="getBadgeClass(currentLevel?.level_id)">
            <i class="fas fa-chess-queen"></i>
            <span>{{ currentLevel?.name }}</span>
          </div>
          <div class="current-points">
            <span class="label">Điểm rèn luyện:</span>
            <span class="value">{{ userPoints?.total_exp || 0 }}</span>
          </div>
          <div class="current-currency">
            <span class="label text-blue-400">Linh Thạch:</span>
            <span class="value text-blue-200">{{ userCurrency || 0 }}</span>
          </div>
        </div>
        
        <div class="stats-right">
          <div class="progress-info">
            <span>Tiến độ thăng cấp</span>
            <span class="progress-numbers">
                {{ userPoints?.total_exp || 0 }} / {{ currentLevel?.next_level_points || 'MAX' }}
            </span>
          </div>
          <ProgressBar 
            :percent="levelProgress" 
            :height="12" 
            color="#4caf50" 
          />
          <p class="next-level-hint" v-if="currentLevel?.next_level_name">
            Cấp tiếp theo: {{ currentLevel.next_level_name }}
          </p>
        </div>
      </div>

      <!-- Main Content Tabs/Grid -->
      <div class="content-grid">
        <!-- Tasks Column -->
        <div class="tasks-section">
          <h2 class="section-title">
            <i class="fas fa-scroll"></i> Bảng Nhiệm Vụ
          </h2>
          
          <div v-if="loading.tasks" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i> Đang tải nhiệm vụ...
          </div>
          
          <div v-else class="tasks-list">
            <div v-if="tasks.length === 0" class="empty-state">
              Hiện chưa có nhiệm vụ nào.
            </div>
            <TaskItem 
              v-for="task in activeTasks" 
              :key="task.task_id" 
              :task="task" 
              :loading="processingTask === task.task_id"
              @complete="handleCompleteTask"
            />
            
            <!-- Completed tasks section -->
            <div v-if="completedTasks.length > 0" class="completed-section">
              <h3 class="subsection-title">Đã hoàn thành</h3>
              <TaskItem 
                v-for="task in completedTasks" 
                :key="task.task_id" 
                :task="task" 
                disabled
              />
            </div>
          </div>
        </div>

        <!-- Rewards Column -->
        <div class="rewards-section">
          <h2 class="section-title">
            <i class="fas fa-gift"></i> Đổi Thưởng
          </h2>

          <div v-if="loading.rewards" class="loading-state">
             <i class="fas fa-spinner fa-spin"></i> Đang tải quà...
          </div>
          
          <div v-else class="rewards-grid">
            <div v-if="rewards.length === 0" class="empty-state">
              Chưa có phần thưởng nào.
            </div>
            <RewardItem 
              v-for="reward in rewards" 
              :key="reward.reward_id" 
              :reward="reward"
              :userCurrency="userCurrency || 0"
              :userLevelId="currentLevel?.level_id || 1"
              :loading="processingReward === reward.reward_id"
              @claim="handleClaimReward"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useGamification } from '@/composables/useGamification';
import { useAuthStore } from '@/modules/auth/auth.store';
import ProgressBar from '@/components/gamification/ProgressBar.vue';
import TaskItem from '@/components/gamification/TaskItem.vue';
import RewardItem from '@/components/gamification/RewardItem.vue';

export default {
  name: 'TasksView',
  components: {
    ProgressBar,
    TaskItem,
    RewardItem
  },
  setup() {
    const authStore = useAuthStore();
    const { 
      userPoints, 
      currentLevel, 
      tasks, 
      rewards,
      userCurrency, // New
      fetchUserPoints,
      fetchCurrentLevel,
      fetchTasks,
      fetchRewards, 
      fetchUserCurrency, // New
      completeTask,
      claimReward,
      buyReward // New
    } = useGamification();

    const processingTask = ref(null);
    const processingReward = ref(null);
    const loading = ref({ tasks: false, rewards: false });

    onMounted(async () => {
      if (authStore.user?.id) {
        // Parallel fetch for speed
        const p1 = fetchUserPoints(authStore.user.id);
        const p2 = fetchCurrentLevel(authStore.user.id);
        const p5 = fetchUserCurrency(); // New
        
        loading.value.tasks = true;
        const p3 = fetchTasks().finally(() => loading.value.tasks = false);
        
        loading.value.rewards = true;
        const p4 = fetchRewards(1, 100).finally(() => loading.value.rewards = false);

        await Promise.all([p1, p2, p3, p4, p5]);
      }
    });

    const activeTasks = computed(() => tasks.value.filter(t => t.status !== 'completed'));
    const completedTasks = computed(() => tasks.value.filter(t => t.status === 'completed'));

    const levelProgress = computed(() => {
        if (!userPoints.value || !currentLevel.value) return 0;
        const current = userPoints.value.total_exp || 0; // Fix: total_exp
        const next = currentLevel.value.next_level_points || 1000; 
        const percent = (current / next) * 100;
        return Math.min(Math.max(percent, 0), 100);
    });

    const handleCompleteTask = async (taskId) => {
      processingTask.value = taskId;
      try {
        await completeTask(taskId);
        if (authStore.user?.id) {
           await fetchUserPoints(authStore.user.id);
           await fetchCurrentLevel(authStore.user.id); // Refresh level too
        }
      } finally {
        processingTask.value = null;
      }
    };

    const handleClaimReward = async (rewardId) => {
      if (!authStore.user?.id) return;
      processingReward.value = rewardId;
      try {
        // Distinguish Buy vs Claim
        const reward = rewards.value.find(r => r.reward_id === rewardId);
        if (reward && reward.price > 0) {
             await buyReward(rewardId, authStore.user.id);
             await fetchUserCurrency(); // Refresh currency
        } else {
             await claimReward(rewardId, authStore.user.id);
        }
        
        await fetchUserPoints(authStore.user.id);
      } finally {
        processingReward.value = null;
      }
    };
    
    // Badge class helper
    const getBadgeClass = (id) => {
        if (!id) return '';
        if (id <= 5) return 'badge-bronze';
        if (id <= 10) return 'badge-silver';
        if (id <= 15) return 'badge-gold';
        if (id <= 20) return 'badge-platinum';
        return 'badge-diamond';
    };

    return {
      userPoints,
      currentLevel,
      tasks,
      rewards,
      userCurrency, // Return to template
      activeTasks,
      completedTasks,
      levelProgress,
      handleCompleteTask,
      handleClaimReward,
      processingTask,
      processingReward,
      loading,
      getBadgeClass
    };
  }
}
</script>

<style scoped>
/* Scoped styles */
.tasks-page {
  min-height: 100vh;
  background: #1a1d29;
  color: #fff;
  padding: 40px 20px;
}

.tasks-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-family: "Sora", sans-serif;
  font-size: 2.5rem;
  color: #4caf50;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.header-decoration {
  height: 4px;
  width: 100px;
  background: linear-gradient(90deg, transparent, #4caf50, transparent);
  margin: 0 auto;
  border-radius: 2px;
}

/* Stats Card */
.stats-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 16px;
  padding: 30px;
  display: flex;
  gap: 40px;
  align-items: center;
  margin-bottom: 40px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.stats-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding-right: 20px;
}

.stats-right {
  flex: 2;
}

.level-badge-large {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 30px;
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

/* Badge colors copy */
.badge-bronze { background: linear-gradient(135deg, #cd7f32, #a05a2c); }
.badge-silver { background: linear-gradient(135deg, #C0C0C0, #808080); }
.badge-gold { background: linear-gradient(135deg, #FFD700, #B8860B); color: #000; }
.badge-platinum { background: linear-gradient(135deg, #E5E4E2, #708090); color: #000; }
.badge-diamond { background: linear-gradient(135deg, #b9f2ff, #00bfff); color: #000; }

.current-points {
  font-family: "Manrope", sans-serif;
  font-size: 1.1rem;
}

.current-points .label { color: #aaa; margin-right: 8px; }
.current-points .value { color: #ffeb3b; font-weight: bold; font-size: 1.3rem; }

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #ddd;
}

.next-level-hint {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #4caf50;
  text-align: right;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.section-title {
  font-size: 1.5rem;
  color: #fff;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;
}

.section-title i { color: #4caf50; }

.tasks-section, .rewards-section {
  background: rgba(30, 30, 40, 0.6);
  border-radius: 12px;
  padding: 20px;
}

.rewards-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 30px;
  color: #888;
}

.completed-section {
  margin-top: 30px;
  opacity: 0.8;
}

.subsection-title {
  font-size: 1.1rem;
  color: #aaa;
  margin-bottom: 15px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
  padding-bottom: 5px;
}

@media (max-width: 900px) {
  .stats-card { flex-direction: column; gap: 20px; text-align: center; }
  .stats-left { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; padding-right: 0; width: 100%; }
  .content-grid { grid-template-columns: 1fr; }
}
</style>
