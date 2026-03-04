<template>
  <div class="history-view-container-xianxia">
    
    <main class="main-content">
      <div class="container">
        
        <!-- THẦN THỨC HEADER -->
        <div class="section-header-aura animate-fadeIn">
          <h2 class="section-title-xianxia">Vết Tích Tu Luyện</h2>
          <p class="section-subtitle">Lưu lại thần thức để tiếp tục con đường trường sinh</p>
          <div class="header-divider-spirit">
            <div class="dot"></div>
          </div>
        </div>

        <!-- TRẠNG THÁI CẢM ỨNG (LOADING) -->
        <div v-if="historyStore.loading" class="loading-aura-container">
          <div class="skeleton-list-xianxia">
            <div v-for="n in 5" :key="n" class="skeleton-history-pill">
              <div class="skeleton-cover-small"></div>
              <div class="skeleton-info-long">
                <div class="line"></div>
                <div class="line short"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- THIÊN CƠ NHIỄU LOẠN (ERROR) -->
        <div v-else-if="historyStore.error" class="state-box-aura error">
          <i class="fas fa-burst text-rose-500 opacity-50"></i>
          <p>Thiên cơ nhiễu loạn: {{ historyStore.error }}</p>
        </div>

        <!-- VÔ PHÁP TRUY VẾT (EMPTY STATE) -->
        <div v-else-if="historyStore.history.length === 0" class="state-box-aura empty">
          <i class="fas fa-feather opacity-20"></i>
          <h3>Vô Pháp Truy Vết</h3>
          <p>Đạo hữu chưa để lại thần thức tại bất kỳ bí tịch nào trong vạn giới.</p>
          <router-link to="/truyen-chu" class="btn-seek-destiny">
            <i class="fas fa-compass-drafting mr-2"></i>
            Tầm Tiên Lộ
          </router-link>
        </div>

        <!-- DANH SÁCH THẦN THỨC (HISTORY LIST) -->
        <div v-else class="history-spirit-content animate-fadeIn">
          <div class="history-list-v2">
            <div v-for="item in historyStore.history" :key="item.truyen_id" class="history-pill-item group">
              
              <!-- Bìa Linh Vật -->
              <router-link :to="`/truyen-chu/${item.truyen_slug}`" class="history-cover-spirit">
                <img 
                  :src="item.anh_bia" 
                  :alt="item.ten_truyen"
                  class="cover-img"
                  @error="handleImageError"
                />
                <div class="cover-glow"></div>
              </router-link>

              <!-- Thông Tin Lĩnh Hội -->
              <div class="history-info-spirit">
                <router-link :to="`/truyen-chu/${item.truyen_slug}`" class="story-title-aura">
                  {{ item.ten_truyen }}
                </router-link>
                
                <div class="chapter-spirit-info">
                  <span class="label">Đọc tiếp:</span>
                  <span class="chapter-name">{{ item.chuong_moi_nhat }}</span>
                </div>

                <div class="time-spirit-info">
                  <i class="fas fa-hourglass-half opacity-50"></i>
                  <span>lưu dấu: {{ timeAgo(item.thoi_gian_doc) }}</span>
                </div>
              </div>

              <!-- Nút Tiếp Tục Đột Phá -->
              <div class="action-spirit-area">
                <router-link 
                  v-if="item.chuong_slug"
                  :to="`/truyen-chu/${item.truyen_slug}/${item.chuong_slug}`" 
                  class="btn-continue-cultivation"
                >
                  <i class="fas fa-bolt-lightning mr-2"></i>
                  <span>Lĩnh Hội Tiếp</span>
                </router-link>
              </div>

            </div>
          </div>

          <!-- LINH TRẬN PHÂN TRANG -->
          <div v-if="historyStore.pagination.total_pages > 1" class="xianxia-pagination">
            <button 
              class="page-nav-btn" 
              :disabled="!historyStore.hasPrevPage"
              @click="historyStore.prevPage()"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            
            <div class="page-counter-aura">
              Tầng <span class="current">{{ historyStore.pagination.page }}</span> / {{ historyStore.pagination.total_pages }}
            </div>
            
            <button 
              class="page-nav-btn" 
              :disabled="!historyStore.hasNextPage"
              @click="historyStore.nextPage()"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useHistoryStore } from '@/modules/history/history.store';

const historyStore = useHistoryStore();

onMounted(() => {
  historyStore.fetchHistory();
});

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = '/placeholder.jpg';
};

const timeAgo = (date: string) => {
    if (!date) return 'Vừa xong';
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm trước";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng trước";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày trước";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ trước";
    return "Mới đây";
};
</script>

<style scoped>
/* ===== CORE THEME XIANXIA ===== */
.history-view-container-xianxia {
  min-height: 100vh;
  background: #0b0f19; /* Nền tối sâu đồng bộ */
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
  padding-bottom: 80px;
}

.main-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* ===== HEADER SPIRIT ===== */
.section-header-aura {
  text-align: center;
  margin-bottom: 50px;
}

.section-title-xianxia {
  font-size: 2.8rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 4px;
  background: linear-gradient(to right, #34d399, #fff, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 10px rgba(52, 211, 153, 0.3));
}

.section-subtitle {
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-top: 10px;
}

.header-divider-spirit {
  height: 1px;
  width: 240px;
  background: linear-gradient(90deg, transparent, #34d399, transparent);
  margin: 20px auto;
  position: relative;
}

.header-divider-spirit .dot {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);
  width: 8px; height: 8px; background: #34d399; box-shadow: 0 0 10px #34d399;
}

/* ===== HISTORY LIST PILL-STYLE ===== */
.history-list-v2 {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 50px;
}

.history-pill-item {
  display: flex;
  align-items: center;
  padding: 15px 30px 15px 15px;
  background: #131b2c;
  border: 1px solid #1e293b;
  border-radius: 100px; /* Cực đại Pill-style */
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.history-pill-item:hover {
  transform: translateX(15px);
  border-color: #34d39960;
  background: #1a2436;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}

.history-pill-item::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 4px; height: 100%;
  background: #34d399;
  opacity: 0;
  transition: opacity 0.3s;
}

.history-pill-item:hover::before {
  opacity: 1;
}

/* Cover Spirit */
.history-cover-spirit {
  width: 70px;
  height: 95px;
  border-radius: 50px; /* Bìa bo tròn kiểu linh bài */
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid #1e293b;
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
  position: relative;
}

.cover-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.history-pill-item:hover .cover-img { transform: scale(1.1); }

.cover-glow {
  position: absolute; inset: 0;
  background: radial-gradient(circle, rgba(52, 211, 153, 0.2) 0%, transparent 80%);
  opacity: 0; transition: opacity 0.3s;
}
.history-pill-item:hover .cover-glow { opacity: 1; }

/* Info Area */
.history-info-spirit {
  flex: 1;
  margin-left: 25px;
  min-width: 0;
}

.story-title-aura {
  font-size: 1.3rem;
  font-weight: 800;
  color: #f8fafc;
  text-decoration: none;
  display: block;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s;
}

.story-title-aura:hover { color: #34d399; }

.chapter-spirit-info {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 4px;
}

.chapter-spirit-info .chapter-name { color: #34d399; font-weight: 700; margin-left: 5px; }

.time-spirit-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: #475569;
}

/* Action Area */
.action-spirit-area {
  margin-left: 20px;
}

.btn-continue-cultivation {
  display: inline-flex;
  align-items: center;
  padding: 12px 25px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #0b0f19;
  border-radius: 50px;
  font-weight: 900;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 1px;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  transition: all 0.3s;
}

.btn-continue-cultivation:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.5);
}

/* ===== EMPTY STATE AURA ===== */
.state-box-aura {
  text-align: center;
  padding: 80px 20px;
  background: #131b2c;
  border-radius: 24px;
  border: 1px solid #1e293b;
}

.state-box-aura i { font-size: 4rem; margin-bottom: 25px; color: #34d399; }

.btn-seek-destiny {
  display: inline-flex;
  align-items: center;
  padding: 14px 35px;
  margin-top: 30px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #0b0f19;
  border-radius: 12px;
  font-weight: 800;
  text-transform: uppercase;
  text-decoration: none;
  letter-spacing: 1px;
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
}

/* ===== PAGINATION XIANXIA ===== */
.xianxia-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 25px;
}

.page-nav-btn {
  width: 45px; height: 45px;
  background: #131b2c; border: 1px solid #1e293b; border-radius: 12px;
  color: #fff; cursor: pointer; transition: all 0.3s;
}
.page-nav-btn:hover:not(:disabled) { border-color: #34d399; color: #34d399; }
.page-nav-btn:disabled { opacity: 0.2; }

.page-counter-aura { font-weight: 700; color: #64748b; text-transform: uppercase; }
.page-counter-aura .current { color: #34d399; font-weight: 900; }

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn { animation: fadeIn 0.8s ease-out; }

/* Responsive */
@media (max-width: 768px) {
  .section-title-xianxia { font-size: 1.8rem; }
  .history-pill-item { border-radius: 20px; padding: 15px; }
  .history-cover-spirit { width: 50px; height: 70px; border-radius: 12px; }
  .history-info-spirit { margin-left: 15px; }
  .story-title-aura { font-size: 1rem; }
  .action-spirit-area { display: none; } /* Giấu nút lĩnh hội tiếp trên mobile để tiết kiệm diện tích */
}
</style>