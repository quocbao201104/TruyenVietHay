<template>
  <div class="tasks-view">
    
    <!-- TIÊU ĐỀ TRANG -->
    <div class="header-container">
      <h1 class="header-title">Tiên Đồ Lịch Luyện</h1>
      <div class="header-divider">
        <div class="divider-line left"></div>
        <div class="divider-diamond"></div>
        <div class="divider-line right"></div>
      </div>
    </div>

    <div class="main-container">
      
      <!-- KHU VỰC ĐAN ĐIỀN (TRẠNG THÁI TU VI) -->
      <div class="cultivation-panel" v-if="currentLevel">
        <!-- Năng lượng nền -->
        <div class="bg-glow"></div>
        
        <div class="cultivation-content">
          
          <div class="user-stats">
            <div class="badge-container group" :style="{ '--badge-color': equippedBadgeColor }">
              <!-- Vòng xoáy linh khí -->
              <div class="badge-glow"></div>
              
              <div class="badge-icon-wrapper">
                <!-- Hiển thị Badge hiện tại nếu có, hoặc icon mặc định -->
                <img v-if="equippedBadgeUrl" :src="equippedBadgeUrl" class="badge-image" />
                <i v-else class="fas fa-yin-yang badge-icon"></i>
              </div>
              
              <!-- Label Cảnh Giới -->
              <div class="badge-label">
                {{ currentLevel.name }}
              </div>
            </div>
            
            <div class="stats-info">
              <div class="stats-title">Tài Vận</div>
              <div class="stats-grid">
                <div class="stat-card">
                  <i class="fas fa-fire-alt stat-icon exp"></i>
                  
                  <div class="stat-value-group">
                    <span class="stat-value">{{ userPoints?.total_exp?.toLocaleString() || 0 }}</span>
                    <span class="stat-label exp">Tu Vi</span>
                  </div>
                </div>
                <div class="stat-card">
                  <i class="fas fa-coins stat-icon gem"></i>
                  <div class="stat-value-group">
                    <span class="stat-value">{{ userCurrency?.toLocaleString() || 0 }}</span>
                    <span class="stat-label gem">Linh Thạch Hạ Phẩm</span>
                  </div>
                </div>
                <div class="stat-card">
                  <i class="fas fa-hourglass-half stat-icon time"></i>
                  <div class="stat-value-group">
                    <span class="stat-value">{{ remainingLifespan || 'Vô hạn' }}</span>
                    <span class="stat-label time">Thọ Nguyên</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Thanh Đột Phá -->
          <div class="progress-container">
             <div class="progress-header">
              <div class="progress-title-group">
                <span class="progress-ping"></span>
                <span class="progress-title">Bình Cảnh</span>
              </div>
              <span class="progress-text">
                <span class="progress-value">{{ userPoints?.total_exp || 0 }}</span> / {{ currentLevel.next_level_points || 'Đột phá' }}
              </span>
            </div>
            
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" :style="{ width: levelProgress + '%' }">
                <!-- Hiệu ứng dòng chảy linh khí -->
                <div class="progress-shimmer"></div>
              </div>
            </div>
            
            <div class="progress-footer">
              <template v-if="currentLevel.next_level_points">
               <p class="progress-hint" v-if="(userPoints?.total_exp || 0) < currentLevel.next_level_points">
                Đang ngưng tụ <span class="progress-max">{{ (currentLevel.next_level_points - (userPoints?.total_exp || 0)).toLocaleString() }}</span> linh khí để đột phá <span>{{ currentLevel.next_level_name }}</span>...
               </p>
               <div class="upgrade-action" v-else style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <p class="progress-hint" style="color: #34d399; font-weight: bold;">
                  Linh khí viên mãn! Đã có thể đột phá <span>{{ currentLevel.next_level_name }}</span>.
                </p>
                <button @click="handleUpgradeLevel" :disabled="processingUpgrade" class="task-action-btn" style="margin-top: 0; padding: 0.25rem 0.75rem; border-color: #34d399;">
                  <i v-if="processingUpgrade" class="fas fa-spinner fa-spin"></i>
                  <template v-else>
                    ĐỘT PHÁ <i class="fas fa-bolt task-action-icon" style="margin-left: 0.25rem;"></i>
                  </template>
                </button>
               </div>
              </template>
              <p class="progress-max" v-else>
                Tiên lộ gian nan!
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- THANH ĐIỀU HƯỚNG TABS -->
      <div class="tabs-container">
        <button v-for="tab in [{id:'tasks', label:'', icon:'fa-scroll'}, {id:'mailbox', label:'', icon:'fa-envelope-open-text'}, {id:'inventory', label:'', icon:'fa-ring'}]" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
        >
          <i class="fas tab-icon" :class="tab.icon"></i> 
          {{ tab.label }}
          <div v-if="tab.id === 'mailbox' && mailbox.length > 0" class="tab-badge"></div>
          <div v-if="activeTab === tab.id" class="tab-indicator"></div>
        </button>
      </div>

      <!-- NỘI DUNG CHÍNH -->
      <div class="tab-content-area">
        
        <!-- TAB: NHIỆM VỤ -->
        <div v-show="activeTab === 'tasks'" class="animate-fadeIn">
          <div v-if="loading.tasks" class="tasks-loading">
            <i class="fas fa-yin-yang fa-spin"></i>
            <p>Đang cảm ứng Thiên đạo...</p>
          </div>
          
          <div v-else class="tasks-grid">
            <div v-for="task in orderedTasks" :key="task.task_id" 
                class="task-card" :class="{ completed: task.status === 'completed' }">
              
              <!-- Dấu ấn hoàn thành -->
              <div v-if="task.status === 'completed'" class="task-completed-stamp">
                HOÀN TẤT
              </div>
              
              <div class="task-body">
                <div class="task-info-group">
                  <h3 class="task-title">{{ task.title }}</h3>
                  <p class="task-desc">{{ task.description }}</p>
                  
                  <div class="task-rewards">
                     <div class="task-reward-item" v-if="task.points_awarded > 0">
                      <i class="fas fa-bolt task-reward-icon"></i>
                      <span class="task-reward-text">+{{ task.points_awarded }} Tu Vi</span>
                    </div>
                  </div>
                </div>
                
                <!-- <button v-if="task.status !== 'completed'" 
                        class="task-action-btn"
                        @click="handleCompleteTask(task.task_id)"
                        :disabled="processingTask === task.task_id">
                  <i v-if="processingTask === task.task_id" class="fas fa-spinner fa-spin"></i>
                  <template v-else>
                    LỊCH LUYỆN <i class="fas fa-chevron-right task-action-icon"></i>
                  </template>
                </button> -->
              </div>
            </div>
          </div>
        </div>

        <!-- TAB: HỘP THƯ -->
        <div v-show="activeTab === 'mailbox'" class="animate-fadeIn">
          <div v-if="mailbox.length === 0" class="mailbox-empty">
            <i class="fas fa-comment-slash"></i>
            <p>Chưa có truyền âm nào</p>
          </div>
          
          <div v-else class="mailbox-list">
            <div v-for="mail in mailbox" :key="mail.id" class="mail-card">
              
              <div class="mail-body">
                <!-- Icon quà tặng -->
                <div class="mail-icon-wrapper" :class="mail.reward_type">
                  <i v-if="mail.reward_type === 'badge'" class="fas fa-shield-alt"></i>
                  <i v-else-if="mail.reward_type === 'currency'" class="fas fa-gem"></i>
                  <i v-else class="fas fa-magic"></i>
                </div>
                
                <div class="mail-content">
                  <div class="mail-meta">
                    <span class="mail-type-label">Thiên Đạo Ban Thưởng</span>
                    <span class="mail-date">{{ mail.created_at }}</span>
                  </div>
                  <h4 class="mail-title">{{ mail.reward_name }}</h4>
                  <p class="mail-desc">{{ mail.description || 'Đạo hữu xứng đáng nhận được cơ duyên này.' }}</p>
                </div>
              </div>

              <div class="mail-action-group">
                <div class="mail-quantity-box">
                  <div class="mail-quantity-label">Số lượng</div>
                  <div class="mail-quantity-value">x{{ mail.quantity }}</div>
                </div>
                <button @click="handleClaimMailbox(mail.id)" :disabled="processingMailbox === mail.id" class="mail-claim-btn">
                  <i v-if="processingMailbox === mail.id" class="fas fa-spinner fa-spin mr-2"></i>
                  Lĩnh Thưởng
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB: NHẪN TRỮ VẬT (TÚI ĐỒ) -->
        <div v-show="activeTab === 'inventory'" class="animate-fadeIn">
          <div class="inventory-panel">
            <div class="inventory-bg-icon">
                <i class="fas fa-ring"></i>
            </div>

            <div class="inventory-header">
              <div class="inventory-title-group">
                <h3 class="inventory-title">
                  <i class="fas fa-briefcase"></i> Không Gian Giới Chỉ
                </h3>
                <p class="inventory-subtitle">Sưu tầm bảo vật, định danh cảnh giới</p>
              </div>
              <div class="inventory-capacity">
                 <span class="inventory-capacity-label">Dung lượng:</span>
                 <span class="inventory-capacity-value">{{ badges.length }} / 32</span>
              </div>
            </div>
            
            <!-- Lưới túi đồ 8 cột chuẩn game -->
            <div class="inventory-grid">
              <div v-for="badge in badges" :key="badge.reward_id"
                   @click="!badge.is_equipped && handleEquipBadge(badge.reward_id)"
                   class="inventory-slot"
                   :class="{ equipped: badge.is_equipped }"
                   :style="{ '--badge-color': badge.color || '#34d399' }">
                
                <!-- Đang đeo -->
                <div v-if="badge.is_equipped" class="inventory-equipped-glow"></div>
                <div v-if="badge.is_equipped" class="inventory-equipped-badge">
                  <i class="fas fa-check"></i>
                </div>
                
                <!-- Hình ảnh Badge từ Cloudinary -->
                <img :src="badge.icon_url" 
                     class="inventory-badge-img" />
                
                <!-- Tooltip -->
                <div class="inventory-tooltip" :class="{ equipped: badge.is_equipped }">
                  <div class="tooltip-title">{{ badge.badge_name }}</div>
                  <div class="tooltip-desc" :class="{ equipped: badge.is_equipped }">
                    {{ badge.is_equipped ? 'Cảnh giới hiện tại' : 'Nhấn để định danh' }}
                  </div>
                </div>

                <!-- Loading khi đeo -->
                <div v-if="processingEquip === badge.reward_id" class="inventory-loading-overlay">
                  <i class="fas fa-yin-yang fa-spin"></i>
                </div>
              </div>

              <!-- Ô trống ảo cho đủ lưới 32 ô -->
              <div v-for="i in Math.max(0, 32 - badges.length)" :key="'empty-'+i" 
                   class="inventory-slot empty">
                <div class="empty-inner"></div>
              </div>
            </div>
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

export default {
  name: 'TasksView',
  setup() {
    const authStore = useAuthStore();
    const { 
      userPoints, currentLevel, tasks, rewards, mailbox, badges, userCurrency, 
      fetchUserPoints, fetchCurrentLevel, fetchTasks, fetchUserCurrency, 
      fetchMailbox, fetchInventoryBadges, completeTask, claimFromMailbox, equipBadge, upgradeLevel
    } = useGamification();

    const processingTask = ref(null);
    const processingMailbox = ref(null);
    const processingEquip = ref(null);
    const processingUpgrade = ref(false);
    const loading = ref({ tasks: false });
    const activeTab = ref('tasks');

    // Lấy URL badge đang được trang bị để hiển thị ở avatar đan điền
    const equippedBadgeUrl = computed(() => {
        const equipped = badges.value.find(b => b.is_equipped);
        return equipped ? equipped.icon_url : null;
    });

    const equippedBadgeColor = computed(() => {
        const equipped = badges.value.find(b => b.is_equipped);
        return equipped && equipped.color ? equipped.color : '#34d399';
    });

    onMounted(async () => {
      if (authStore.user?.id) {
        // Tải dữ liệu song song
        loading.value.tasks = true;
        await Promise.all([
            fetchUserPoints(authStore.user.id),
            fetchCurrentLevel(authStore.user.id),
            fetchUserCurrency(),
            fetchTasks().finally(() => loading.value.tasks = false),
            fetchMailbox(),
            fetchInventoryBadges()
        ]);
      }
    });

    const orderedTasks = computed(() => {
        return [
           ...tasks.value.filter(t => t.status !== 'completed'),
           ...tasks.value.filter(t => t.status === 'completed')
        ]
    });

    const levelProgress = computed(() => {
        if (!userPoints.value || !currentLevel.value) return 0;
        const current = userPoints.value.total_exp || 0; 
        const next = currentLevel.value.next_level_points || 1000; 
        return Math.min(Math.max((current / next) * 100, 0), 100);
    });

    const remainingLifespan = computed(() => {
        if (!currentLevel.value || !currentLevel.value.end_date) return null;
        
        const endDate = new Date(currentLevel.value.end_date);
        const now = new Date();
        const diffMs = endDate.getTime() - now.getTime();
        
        if (diffMs <= 0) return 'Sắp cạn kiệt';
        
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return `${diffDays} ngày`;
    });

    const handleCompleteTask = async (taskId) => {
      processingTask.value = taskId;
      try {
        await completeTask(taskId);
        if (authStore.user?.id) {
           await fetchUserPoints(authStore.user.id);
           await fetchCurrentLevel(authStore.user.id);
        }
      } finally {
        processingTask.value = null;
      }
    };

    const handleClaimMailbox = async (userRewardId) => {
        processingMailbox.value = userRewardId;
        try {
            await claimFromMailbox(userRewardId);
            if (authStore.user?.id) {
                await fetchUserPoints(authStore.user.id);
                await fetchUserCurrency();
                await fetchInventoryBadges();
                await fetchMailbox();
            }
        } finally {
            processingMailbox.value = null;
        }
    };

    const handleEquipBadge = async (rewardId) => {
        processingEquip.value = rewardId;
        try {
            await equipBadge(rewardId);
        } finally {
            processingEquip.value = null;
        }
    };

    const handleUpgradeLevel = async () => {
    processingUpgrade.value = true;
    try {
        // Truyền ID của Bảo vào đây
        await upgradeLevel(authStore.user.id); 
    } finally {
        processingUpgrade.value = false;
    }
};

    return {
      userPoints, currentLevel, tasks, userCurrency, 
      orderedTasks, levelProgress, remainingLifespan, handleCompleteTask,
      processingTask, processingMailbox, processingEquip, processingUpgrade,
      loading, activeTab, mailbox, badges,
      handleClaimMailbox, handleEquipBadge, handleUpgradeLevel, equippedBadgeUrl, equippedBadgeColor
    };
  }
}
</script>

<style scoped>
/* Reset and Base Styles */
.tasks-view {
  min-height: 100vh;
  background-color: #0b0f19;
  color: #cbd5e1;
  padding: 1rem;
  overflow-x: hidden;
  padding-bottom: 5rem;
}
.tasks-view *::selection {
  background-color: rgba(16, 185, 129, 0.3);
}
@media (min-width: 768px) {
  .tasks-view { padding: 2rem; }
}

/* Header */
.header-container {
  text-align: center;
  margin-bottom: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.header-title {
  font-size: 1.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  background-image: linear-gradient(to right, #34d399, #ffffff, #34d399);
  filter: drop-shadow(0 0 20px rgba(52, 211, 153, 0.6));
  padding: 0.5rem 0;
}
@media (min-width: 768px) {
  .header-title { font-size: 3rem; }
}
.header-divider {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0.75rem;
}
.divider-line {
  height: 1px;
  width: 8rem;
}
.divider-line.left { background: linear-gradient(to right, transparent, rgba(16, 185, 129, 0.5), transparent); }
.divider-line.right { background: linear-gradient(to left, transparent, rgba(16, 185, 129, 0.5), transparent); }
.divider-diamond {
  width: 0.75rem;
  height: 0.75rem;
  background-color: #34d399;
  transform: rotate(45deg);
  margin: 0 1rem;
  box-shadow: 0 0 10px #34d399;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Main Container */
.main-container {
  max-width: 64rem; /* max-w-5xl usually spans 1024px */
  margin: 0 auto;
}

/* Cultivation Panel */
.cultivation-panel {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  background-color: rgba(19, 27, 44, 0.8);
  border: 1px solid rgba(51, 65, 85, 0.5);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  margin-bottom: 2.5rem;
}
.bg-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 400px;
  background-color: rgba(16, 185, 129, 0.05);
  filter: blur(120px);
  border-radius: 50%;
  pointer-events: none;
}
.cultivation-content {
  padding: 2rem;
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 2.5rem;
}
@media (min-width: 1024px) {
  .cultivation-content {
    flex-direction: row;
    padding: 2.5rem;
  }
}
.user-stats {
  display: flex;
  align-items: center;
  gap: 2rem;
  width: 100%;
}
@media (min-width: 1024px) {
  .user-stats { width: auto; }
}

/* Badge (Avatar) */
.badge-container { position: relative; }
.badge-container:hover .badge-glow { opacity: 1; }
.badge-glow {
  position: absolute;
  inset: -10px;
  background: conic-gradient(from 0deg, transparent 0%, var(--badge-color) 40%, transparent 60%);
  border-radius: 50%;
  opacity: 0.6;
  transition: opacity 0.3s;
  filter: blur(10px);
  animation: spin-slow 6s linear infinite;
}
.badge-icon-wrapper {
  position: relative;
  background-color: #0b0f19;
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--badge-color);
  box-shadow: 0 0 20px color-mix(in srgb, var(--badge-color) 40%, transparent);
  margin: 0.25rem;
  overflow: hidden;
}
.badge-image {
  width: 4rem;
  height: 4rem;
  object-fit: contain;
  z-index: 10;
  filter: drop-shadow(0 0 10px rgba(52, 211, 153, 0.8));
}
.badge-icon {
  color: #34d399;
  font-size: 2.25rem;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.badge-label {
  position: absolute;
  bottom: -0.75rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(2, 44, 34, 0.9);
  border: 1px solid color-mix(in srgb, var(--badge-color) 50%, transparent);
  color: var(--badge-color);
  font-size: 11px;
  font-weight: 900;
  padding: 0.25rem 1rem;
  border-radius: 9999px;
  box-shadow: 0 0 15px color-mix(in srgb, var(--badge-color) 40%, transparent);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: -0.05em;
}

/* User Tu Vi / Linh Thach */
.stats-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.stats-title {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 3px;
}
.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: rgba(15, 23, 42, 0.5);
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #1e293b;
}
.stat-icon { font-size: 1.125rem; }
.stat-icon.exp { color: #34d399; }
.stat-icon.gem { color: #facc15; }
.stat-icon.time { color: #60a5fa; }
.stat-value-group {
  display: flex;
  flex-direction: column;
}
.stat-value {
  color: white;
  font-weight: 900;
  font-size: 1.25rem;
  line-height: 1;
}
.stat-label {
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
}
.stat-label.exp { color: rgba(16, 185, 129, 0.7); }
.stat-label.gem { color: rgba(234, 179, 8, 0.7); }
.stat-label.time { color: rgba(96, 165, 250, 0.7); }

/* Progress Bar */
.progress-container {
  width: 100%;
}
@media (min-width: 1024px) {
  .progress-container {
    flex: 1;
    max-width: 42rem;
  }
}
.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 0.75rem;
}
.progress-title-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.progress-ping {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: #34d399;
  animation: pulse 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}
.progress-title {
  color: #34d399;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.75rem;
}
.progress-text {
  color: #94a3b8;
  font-size: 0.75rem;
  font-family: monospace;
}
.progress-value {
  color: #34d399;
  font-weight: 700;
}
.progress-bar-bg {
  height: 1rem;
  width: 100%;
  background-color: #0b0f19;
  border-radius: 9999px;
  padding: 0.25rem;
  border: 1px solid #1e293b;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(to right, #059669, #34d399, #5eead4);
  border-radius: 9999px;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.6);
  transition: width 1s;
  position: relative;
  overflow: hidden;
}
.progress-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent);
  transform: translateX(-100%);
  animation: shimmer 3s infinite linear;
}
.progress-footer {
  margin-top: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.progress-hint {
  color: #64748b;
  font-size: 11px;
  font-style: italic;
}
.progress-max {
  color: #34d399;
  font-size: 11px;
  font-weight: 700;
  font-style: italic;
}

/* Tabs */
.tabs-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  border-bottom: 1px solid #1e293b;
  margin-bottom: 1rem;
}
.tab-btn {
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 900;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.3s;
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
}
.tab-btn:hover { color: #cbd5e1; }
.tab-btn.active { color: #34d399; }
.tab-btn:not(.active) { color: #64748b; }
.tab-badge {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  height: 0.5rem;
  width: 0.5rem;
  background-color: #ef4444;
  border-radius: 50%;
  box-shadow: 0 0 8px #ef4444;
}
.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0.25rem;
  background-color: #34d399;
  box-shadow: 0 0 15px #34d399;
}
.tab-content-area {
  min-height: 500px;
}

/* Tasks Tab */
.tasks-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
  color: rgba(16, 185, 129, 0.5);
}
.tasks-loading i {
  font-size: 2.25rem;
  margin-bottom: 1rem;
}
.tasks-loading p {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.tasks-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  max-width: 48rem;
  margin: 0 auto;
}

.task-card {
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid #1e293b;
  background-color: #131b2c;
  padding: 1.5rem;
  transition: all 0.3s;
}
.task-card:hover {
  border-color: rgba(16, 185, 129, 0.5);
  box-shadow: 0 0 20px rgba(52, 211, 153, 0.1);
}

.task-card.completed {
  border-color: rgba(6, 78, 59, 0.3);
  background-color: rgba(6, 78, 59, 0.05);
  opacity: 0.6;
}
.task-card.completed:hover {
  border-color: rgba(6, 78, 59, 0.3);
  box-shadow: none;
}

.task-completed-stamp {
  position: absolute;
  right: -2rem;
  top: 1.25rem;
  background-color: rgba(5, 150, 105, 0.8);
  color: white;
  font-size: 9px;
  font-weight: 900;
  padding: 0.25rem 2.5rem;
  transform: rotate(45deg);
}

.task-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
}

.task-info-group {
  flex: 1;
}

.task-title {
  font-weight: 700;
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
  color: #f1f5f9;
}
.task-card.completed .task-title {
  color: rgba(16, 185, 129, 0.5);
}

.task-desc {
  color: #64748b;
  font-size: 0.75rem;
  margin-bottom: 1rem;
  line-height: 1.625;
}

.task-rewards {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.task-reward-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background-color: rgba(16, 185, 129, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.task-reward-icon {
  color: #34d399;
  font-size: 10px;
}

.task-reward-text {
  color: #34d399;
  font-weight: 900;
  font-size: 0.75rem;
}

.task-action-btn {
  margin-top: 0.25rem;
  flex-shrink: 0;
  background-color: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.5);
  color: #34d399;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 900;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.task-action-btn:hover:not(:disabled) {
  background-color: #10b981;
  color: #0b0f19;
}
.task-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mailbox */
.mailbox-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 0;
  opacity: 0.3;
}
.mailbox-empty i { font-size: 3rem; margin-bottom: 1rem; }
.mailbox-empty p { text-transform: uppercase; letter-spacing: 0.2em; font-size: 0.875rem; }

.mailbox-list {
  max-width: 56rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mail-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-radius: 1rem;
  background-color: #131b2c;
  border: 1px solid #1e293b;
  transition: all 0.3s;
}
@media (min-width: 768px) { .mail-card { flex-direction: row; } }
.mail-card:hover { border-color: rgba(16, 185, 129, 0.4); }

.mail-body {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
}

.mail-icon-wrapper {
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid;
  flex-shrink: 0;
  transition: transform 0.3s;
}
.mail-card:hover .mail-icon-wrapper { transform: scale(1.1); }
.mail-icon-wrapper.badge { background-color: rgba(4, 47, 46, 0.4); border-color: rgba(20, 184, 166, 0.3); }
.mail-icon-wrapper.currency { background-color: rgba(69, 26, 3, 0.4); border-color: rgba(245, 158, 11, 0.3); }
.mail-icon-wrapper.exp { background-color: rgba(2, 44, 34, 0.4); border-color: rgba(16, 185, 129, 0.3); }

.mail-icon-wrapper i { font-size: 1.5rem; }
.mail-icon-wrapper.badge i { color: #2dd4bf; }
.mail-icon-wrapper.currency i { color: #fbbf24; }
.mail-icon-wrapper.exp i { color: #34d399; }

.mail-content { flex: 1; }
.mail-meta { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
.mail-type-label { font-size: 10px; font-weight: 900; padding: 0.125rem 0.5rem; border-radius: 0.25rem; background-color: rgba(16, 185, 129, 0.1); color: #34d399; text-transform: uppercase; letter-spacing: -0.05em; }
.mail-date { color: #475569; font-size: 10px; }
.mail-title { color: #f1f5f9; font-weight: 900; font-size: 1.125rem; margin: 0; }
.mail-desc { color: #64748b; font-size: 0.75rem; margin-top: 0.25rem; }

.mail-action-group {
  margin-top: 1rem;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
}
@media (min-width: 768px) {
  .mail-action-group { margin-top: 0; width: auto; }
}

.mail-quantity-box { text-align: right; display: none; }
@media (min-width: 768px) { .mail-quantity-box { display: block; } }
.mail-quantity-label { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; }
.mail-quantity-value { color: #34d399; font-weight: 900; font-size: 1.25rem; }

.mail-claim-btn {
  width: 100%;
  background: linear-gradient(to right, #059669, #14b8a6);
  color: #0b0f19;
  font-weight: 900;
  padding: 0.75rem 2rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  box-shadow: 0 10px 20px rgba(52, 211, 153, 0.2);
  transition: all 0.3s;
  border: none;
  cursor: pointer;
}
@media (min-width: 768px) { .mail-claim-btn { width: auto; } }
.mail-claim-btn:hover:not(:disabled) { background: linear-gradient(to right, #34d399, #5eead4); }
.mail-claim-btn:active:not(:disabled) { transform: scale(0.95); }
.mail-claim-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* Invertory */
.inventory-panel {
  background-color: #131b2c;
  padding: 2rem;
  border-radius: 1.5rem;
  border: 1px solid #1e293b;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: hidden;
}
.inventory-bg-icon {
  position: absolute;
  top: 0;
  right: 0;
  padding: 2.5rem;
  opacity: 0.05;
  pointer-events: none;
}
.inventory-bg-icon i { font-size: 12.5rem; color: #10b981; }

.inventory-header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  gap: 1rem;
}
@media (min-width: 768px) { .inventory-header { flex-direction: row; } }

.inventory-title-group h3 {
  color: #34d399;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 4px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}
.inventory-title-group p { color: #64748b; font-size: 11px; margin-top: 0.25rem; font-style: italic; }

.inventory-capacity {
  background-color: #0f172a;
  border: 1px solid #1e293b;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
}
.inventory-capacity-label { color: #64748b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.inventory-capacity-value { color: #34d399; font-weight: 900; margin-left: 0.5rem; }

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
@media (min-width: 640px) { .inventory-grid { grid-template-columns: repeat(6, 1fr); } }
@media (min-width: 768px) { .inventory-grid { grid-template-columns: repeat(8, 1fr); } }
@media (min-width: 1024px) { .inventory-grid { padding: 0 2.5rem; } }

.inventory-slot {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
  background-color: #0b0f19;
  border: 1px solid #1e293b;
}
.inventory-slot:hover { border-color: color-mix(in srgb, var(--badge-color) 50%, transparent); background-color: color-mix(in srgb, var(--badge-color) 10%, transparent); }

.inventory-slot.equipped {
  background-color: color-mix(in srgb, var(--badge-color) 10%, transparent);
  border: 2px solid var(--badge-color);
  box-shadow: 0 0 20px color-mix(in srgb, var(--badge-color) 30%, transparent);
}
.inventory-slot.empty {
  background-color: rgba(11, 15, 25, 0.3);
  border: 1px solid rgba(15, 23, 42, 0.5);
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  cursor: default;
}
.empty-inner {
  width: 33.33%;
  height: 33.33%;
  background-color: rgba(30, 41, 59, 0.1);
  border-radius: 50%;
  filter: blur(1px);
  transition: background-color 0.3s;
}
.inventory-slot.empty:hover .empty-inner { background-color: rgba(16, 185, 129, 0.05); }

.inventory-equipped-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, color-mix(in srgb, var(--badge-color) 20%, transparent), transparent);
  pointer-events: none;
}
.inventory-equipped-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: var(--badge-color);
  color: #0b0f19;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.inventory-equipped-badge i { font-size: 10px; font-weight: 900; }

.inventory-badge-img {
  width: 3rem;
  height: 3rem;
  object-fit: contain;
  transition: transform 0.3s;
  z-index: 10;
  opacity: 0.6;
}
.inventory-slot:hover .inventory-badge-img { transform: scale(1.1); opacity: 1; }
.inventory-slot.equipped .inventory-badge-img { opacity: 1; filter: drop-shadow(0 0 8px color-mix(in srgb, var(--badge-color) 50%, transparent)); }

.inventory-tooltip {
  position: absolute;
  bottom: 100%;
  margin-bottom: 0.75rem;
  left: 50%;
  transform: translateX(-50%) scale(0.9);
  background-color: #1a2333;
  border: 1px solid color-mix(in srgb, var(--badge-color) 30%, transparent);
  color: white;
  font-size: 10px;
  padding: 0.75rem;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  z-index: 50;
  pointer-events: none;
  transition: all 0.3s;
  opacity: 0;
  width: 8rem;
  text-align: center;
}
.inventory-slot:hover .inventory-tooltip { opacity: 1; transform: translateX(-50%) scale(1); }
.tooltip-title { font-weight: 900; color: var(--badge-color); margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: -0.05em; }
.tooltip-desc { color: #64748b; }
.tooltip-desc.equipped { color: white; }

.inventory-loading-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
  backdrop-filter: blur(1px);
}
.inventory-loading-overlay i { color: #34d399; }

/* Effects */
@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
@keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #0b0f19; }
::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #34d399; }
</style>
